import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { runVerificationMigration } from "../db";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Enable CORS for all routes - reflect the request origin to support credentials
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
    res.header("Access-Control-Allow-Credentials", "true");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerOAuthRoutes(app);
  await registerPayFastITN(app);

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  // Run database migrations
  await runVerificationMigration();

  server.listen(port, () => {
    console.log(`[api] server listening on port ${port}`);
  });
}

startServer().catch(console.error);

// ---------------------------------------------------------------------------
// PayFast ITN (Instant Transaction Notification) webhook
// PayFast POSTs to this URL after every payment to confirm server-side.
// Docs: https://developers.payfast.co.za/docs#step_4_confirm_payment
// ---------------------------------------------------------------------------
import crypto from "crypto";
import { getDb } from "../db.js";
import { bookings } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";

async function registerPayFastITN(app: ReturnType<typeof express>) {
  app.post("/api/payfast/notify", express.urlencoded({ extended: false }), async (req, res) => {
    // PayFast expects an empty 200 immediately, then we process
    res.sendStatus(200);

    try {
      const data = req.body as Record<string, string>;
      const { signature, ...fields } = data;

      // 1. Rebuild signature string — alphabetical order, skip signature field
      const paramString = Object.keys(fields)
        .sort()
        .map((k) => `${k}=${encodeURIComponent(fields[k]).replace(/%20/g, "+")}`)
        .join("&");

      const MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY ?? "grvghx5kh378h";
      const localSig = crypto
        .createHash("md5")
        .update(`${paramString}&passphrase=${encodeURIComponent(MERCHANT_KEY)}`)
        .digest("hex");

      if (localSig !== signature) {
        console.error("[PayFast ITN] Signature mismatch — possible fraud attempt");
        return;
      }

      // 2. Verify payment status
      const paymentStatus = data["payment_status"]; // "COMPLETE" | "CANCELLED" | "FAILED"
      const transactionId   = data["m_payment_id"];  // our booking reference

      if (!transactionId) {
        console.error("[PayFast ITN] Missing m_payment_id in notification");
        return;
      }

      const db = await getDb();
      if (!db) return;

      const newStatus =
        paymentStatus === "COMPLETE"  ? "confirmed"  :
        paymentStatus === "CANCELLED" ? "cancelled"  : "cancelled";

      await db
        .update(bookings)
        .set({ status: newStatus as any })
        .where(eq(bookings.transactionId, transactionId));

      console.log(`[PayFast ITN] Booking ${transactionId} → ${newStatus}`);
    } catch (err) {
      console.error("[PayFast ITN] Processing error:", err);
    }
  });
}
