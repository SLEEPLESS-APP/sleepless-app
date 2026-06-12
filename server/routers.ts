import { COOKIE_NAME } from "../shared/const.js";
import { events } from "../drizzle/schema.js";
import { eq, and, sql } from "drizzle-orm";
import { getDb } from "./db.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getOrganizerStats, getOrganizerEvents, getEventBookings, getPendingEvents, approveEvent, rejectEvent, getOrganizerAnalytics, createOrganizer, getOrganizerByEmail, createEvent, updateEvent, getAdminMetrics, getAuditLog, logAdminAction, loginOrganizer, updateOrganizerPassword, createPasswordResetToken, getPasswordResetToken, markTokenAsUsed, getEventById, getPendingOrganizers, approveOrganizer, rejectOrganizer, getTicketTypesByEventId, createTicketTypes, updateTicketType, deleteTicketType, deleteTicketTypesByEventId, checkTicketTypeAvailability, incrementTicketTypeSold, getOrganizerByEventId, createBooking, getBookingsByUserId, loginAdmin, seedAdminAccount, registerUser, loginUser, deleteEvent, updateOrganizerProfile } from "./db.js";
import { checkDuplicateEvent } from "./checkDuplicate.js";
import { sendEventApprovalEmail, sendEventRejectionEmail, sendEmail, sendBookingConfirmationEmail } from "./email.js";
import { storagePut } from "./storage.js";
import { z } from "zod";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Public event routes
  events: router({
    getById: publicProcedure
      .input(z.object({ eventId: z.number() }))
      .query(async ({ input }) => {
        return await getEventById(input.eventId);
      }),
    getApproved: publicProcedure
      .input(
        z.object({
          city: z.string().optional(),
          province: z.string().optional(),
          eventType: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) {
          return [];
        }

        try {
          let query = db
            .select()
            .from(events)
            .where(
              eq(events.status, "approved")
            )
            .orderBy(events.eventDate);

          const allEvents = await query;

          // Filter by city and province if provided
          let filteredEvents = allEvents;
          if (input.city) {
            filteredEvents = filteredEvents.filter((e: any) => e.city.toLowerCase() === input.city!.toLowerCase());
          }
          if (input.province) {
            filteredEvents = filteredEvents.filter((e: any) => e.province.toLowerCase() === input.province!.toLowerCase());
          }
          if (input.eventType) {
            filteredEvents = filteredEvents.filter((e: any) => e.eventType.toLowerCase() === input.eventType!.toLowerCase());
          }

          return filteredEvents;
        } catch (error) {
          console.error("[Database] Failed to get approved events:", error);
          return [];
        }
      }),
  }),

  // Organizer routes
  organizer: router({
    login: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        const organizer = await loginOrganizer(input.email, input.password);

        if (!organizer) {
          return {
            success: false,
            message: "Incorrect email or password",
          };
        }

        if (organizer.verified === 0) {
          return {
            success: false,
            message: "Your account is pending verification. Please wait for admin approval.",
          };
        }

        return {
          success: true,
          organizer,
        };
      }),
    register: publicProcedure
      .input(
        z.object({
          companyName: z.string().min(1),
          email: z.string().email(),
          phone: z.string().optional(),
          website: z.string().optional(),
          bio: z.string().optional(),
          password: z.string().min(6).optional(),
          verificationDocuments: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Check if organizer already exists
        const existing = await getOrganizerByEmail(input.email);
        if (existing) {
          throw new Error("An organizer with this email already exists");
        }

        const organizer = await createOrganizer(input);
        if (!organizer) {
          console.warn("[Register] Organizer created but fetch-back returned null");
          return { success: true, organizer: null };
        }

        // Send welcome email
        try {
          await sendEmail({
            to: input.email,
            subject: "Welcome to Sleepless – Application Received!",
            html: `
              <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a1a;color:#fff;padding:32px;border-radius:12px;">
                <h1 style="color:#ff6b6b;font-size:28px;margin-bottom:8px;">Welcome to Sleepless! 🎉</h1>
                <p style="color:#ccc;font-size:16px;">Hi <strong>${organizer.companyName}</strong>,</p>
                <p style="color:#ccc;">Thank you for registering as an event organizer on Sleepless. Your application has been received and is currently being reviewed by our admin team.</p>
                <div style="background:#1a1a2e;border-left:4px solid #ff6b6b;padding:16px;border-radius:8px;margin:24px 0;">
                  <p style="color:#fff;margin:0;font-size:15px;">⏳ <strong>What happens next?</strong></p>
                  <p style="color:#ccc;margin:8px 0 0 0;">Our team will review your application and approve your account within 24-48 hours. You'll receive an email notification once your account is activated.</p>
                </div>
                <p style="color:#ccc;">Once approved, you'll be able to:</p>
                <ul style="color:#ccc;">
                  <li>Create and manage events</li>
                  <li>Sell tickets directly on the platform</li>
                  <li>Track attendance and analytics</li>
                </ul>
                <p style="color:#888;font-size:13px;margin-top:32px;">If you have any questions, contact us at admin@sleeplessapp.co.za</p>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error("[Register] Failed to send welcome email:", emailErr);
        }

        return { success: true, organizer };
      }),
    stats: publicProcedure
      .input(z.object({ organizerId: z.number() }))
      .query(async ({ input }) => {
        return await getOrganizerStats(input.organizerId);
      }),
    events: publicProcedure
      .input(z.object({ organizerId: z.number() }))
      .query(async ({ input }) => {
        return await getOrganizerEvents(input.organizerId);
      }),
    uploadImage: publicProcedure
      .input(
        z.object({
          base64Data: z.string(),
          fileName: z.string(),
          contentType: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64Data, "base64");
        const timestamp = Date.now();
        const key = `events/${timestamp}-${input.fileName}`;
        const result = await storagePut(key, buffer, input.contentType);
        return { url: result.url };
      }),
    bookings: publicProcedure
      .input(z.object({ eventId: z.number() }))
      .query(async ({ input }) => {
        return await getEventBookings(input.eventId);
      }),
    deleteEvent: publicProcedure
      .input(z.object({ eventId: z.number(), organizerId: z.number() }))
      .mutation(async ({ input }) => {
        const ok = await deleteEvent(input.eventId, input.organizerId);
        return { success: ok };
      }),

    updateProfile: publicProcedure
      .input(z.object({
        organizerId: z.number(),
        companyName: z.string().optional(),
        contactPhone: z.string().optional(),
        website: z.string().optional(),
        bio: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { organizerId, ...data } = input;
        const ok = await updateOrganizerProfile(organizerId, data);
        return { success: ok };
      }),

    analytics: publicProcedure
      .input(z.object({ organizerId: z.number() }))
      .query(async ({ input }) => {
        return await getOrganizerAnalytics(input.organizerId);
      }),
    createEvent: publicProcedure
      .input(
        z.object({
          organizerId: z.number(),
          title: z.string().min(1),
          description: z.string().min(1),
          venue: z.string().min(1),
          address: z.string(),
          city: z.string().min(1),
          province: z.string().min(1),
          posterUrl: z.string().url(),
          eventDate: z.string(), // ISO date string
          eventTime: z.string(),
          eventType: z.string(),
          price: z.number().min(0),
          ticketsAvailable: z.number().min(1),
          status: z.enum(["draft", "pending"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Check for duplicate event (same title, venue, date by same organizer)
        const duplicateCheck = await checkDuplicateEvent({
          organizerId: input.organizerId,
          title: input.title,
          venue: input.venue,
          eventDate: new Date(input.eventDate),
        });

        if (duplicateCheck.isDuplicate) {
          const existingStatus = duplicateCheck.existingEvent?.status || "pending";
          throw new Error(
            `You already have an event "${input.title}" at "${input.venue}" on this date. ` +
            `Current status: ${existingStatus}. Please edit the existing event instead of creating a duplicate.`
          );
        }

        const event = await createEvent({
          ...input,
          eventDate: new Date(input.eventDate),
        });

        if (!event) {
          throw new Error("Failed to create event");
        }

        return { success: true, event };
      }),
    updateEvent: publicProcedure
      .input(
        z.object({
          id: z.number(),
          organizerId: z.number(),
          title: z.string().min(1),
          description: z.string().min(1),
          venue: z.string().min(1),
          address: z.string(),
          city: z.string().min(1),
          province: z.string().min(1),
          posterUrl: z.string().url(),
          eventDate: z.string(),
          eventTime: z.string(),
          eventType: z.string(),
          price: z.number().min(0),
          ticketsAvailable: z.number().min(1),
          status: z.enum(["draft", "pending"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const event = await updateEvent({
          ...input,
          eventDate: new Date(input.eventDate),
        });

        if (!event) {
          throw new Error("Failed to update event");
        }

        return { success: true, event };
      }),
    requestPasswordReset: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const organizer = await getOrganizerByEmail(input.email);
        if (!organizer) {
          // Don't reveal if email exists or not for security
          return { success: true };
        }

        const token = await createPasswordResetToken(organizer.id);
        if (!token) {
          throw new Error("Failed to create reset token");
        }

        // Send password reset email
        const resetUrl = `https://sleeplessapp.co.za/organizer/reset-password?token=${token}`;
        await sendEmail({
          to: input.email,
          subject: "Reset Your Sleepless Organizer Password",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ff6b6b;">Reset Your Password</h2>
              <p>You requested to reset your password for your Sleepless organizer account.</p>
              <p>Click the button below to reset your password:</p>
              <a href="${resetUrl}" style="display: inline-block; background-color: #ff6b6b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="color: #666; word-break: break-all;">${resetUrl}</p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
            </div>
          `,
        });
        console.log(`[Password Reset] Email sent to ${input.email}`);
        return { success: true };
      }),
    resetPassword: publicProcedure
      .input(
        z.object({
          token: z.string(),
          newPassword: z.string().min(6),
        })
      )
      .mutation(async ({ input }) => {
        const tokenData = await getPasswordResetToken(input.token);
        
        if (!tokenData) {
          throw new Error("Invalid or expired reset token");
        }

        if (tokenData.used === 1) {
          throw new Error("This reset link has already been used");
        }

        if (new Date() > tokenData.expiresAt) {
          throw new Error("This reset link has expired");
        }

        // Update password
        const success = await updateOrganizerPassword(tokenData.organizerId, input.newPassword);
        if (!success) {
          throw new Error("Failed to update password");
        }

        // Mark token as used
        await markTokenAsUsed(tokenData.id);

        return { success: true };
      }),
  }),

  // Admin routes
  admin: router({
    /**
     * DB-backed admin login. Returns a signed token stored client-side.
     * Replaces the old hardcoded credential check in app/admin/login.tsx.
     */
    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(6) }))
      .mutation(async ({ input }) => {
        const admin = await loginAdmin(input.email, input.password);
        if (!admin) return { success: false, error: "Invalid credentials" };
        return { success: true, adminId: admin.id, email: admin.email };
      }),

    /**
     * One-time seed endpoint — creates the admin account in the DB.
     * REMOVE or guard this endpoint after you've run it once in production.
     */
    seed: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(8), secret: z.string() }))
      .mutation(async ({ input }) => {
        // Basic shared-secret guard — set ADMIN_SEED_SECRET in your env
        const secret = process.env.ADMIN_SEED_SECRET ?? "change-me-before-production";
        if (input.secret !== secret) return { success: false, error: "Forbidden" };
        const ok = await seedAdminAccount(input.email, input.password);
        return { success: ok };
      }),
    metrics: publicProcedure
      .query(async () => {
        return await getAdminMetrics();
      }),
    auditLog: publicProcedure
      .query(async () => {
        return await getAuditLog(100);
      }),
    pendingEvents: publicProcedure
      .input(z.object({ status: z.enum(["pending", "all"]) }))
      .query(async ({ input }) => {
        return await getPendingEvents(input.status);
      }),
    approveEvent: publicProcedure
      .input(z.object({ eventId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const success = await approveEvent(input.eventId);
        if (!success) throw new Error("Failed to approve event");
        
        // Log admin action
        if (ctx.user) {
          await logAdminAction({
            adminId: ctx.user.id,
            adminName: ctx.user.name || "Admin",
            action: "approve",
            targetType: "event",
            targetId: input.eventId,
            eventId: input.eventId,
          });
        }
        
        // TODO: Fetch event and organizer details to send email
        // const event = await getEventById(input.eventId);
        // const organizer = await getOrganizerById(event.organizerId);
        // await sendEventApprovalEmail(organizer.email, event.title, event.id);
        
        return { success: true };
      }),
    rejectEvent: publicProcedure
      .input(z.object({ eventId: z.number(), reason: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const success = await rejectEvent(input.eventId, input.reason);
        if (!success) throw new Error("Failed to reject event");
        
        // Log admin action
        if (ctx.user) {
          await logAdminAction({
            adminId: ctx.user.id,
            adminName: ctx.user.name || "Admin",
            action: "reject",
            targetType: "event",
            targetId: input.eventId,
            eventId: input.eventId,
            reason: input.reason,
          });
        }
        
        return { success: true };
      }),
    getPendingEvents: publicProcedure
      .query(async () => {
        return await getPendingEvents("pending");
      }),
    getPendingOrganizers: publicProcedure
      .query(async () => {
        return await getPendingOrganizers();
      }),
    approveOrganizer: publicProcedure
      .input(z.object({ organizerId: z.number() }))
      .mutation(async ({ input }) => {
        const success = await approveOrganizer(input.organizerId);
        if (!success) throw new Error("Failed to approve organizer");
        return { success: true };
      }),
    rejectOrganizer: publicProcedure
      .input(z.object({ organizerId: z.number(), reason: z.string() }))
      .mutation(async ({ input }) => {
        const success = await rejectOrganizer(input.organizerId, input.reason);
        if (!success) throw new Error("Failed to reject organizer");
        return { success: true };
      }),
  }),

  // Ticket types routes
  ticketTypes: router({
    getByEventId: publicProcedure
      .input(z.object({ eventId: z.number() }))
      .query(async ({ input }) => {
        return await getTicketTypesByEventId(input.eventId);
      }),
    
    create: publicProcedure
      .input(z.object({
        eventId: z.number(),
        ticketTypes: z.array(z.object({
          name: z.string().min(1).max(100),
          description: z.string().optional(),
          price: z.number().min(0),
          quantity: z.number().min(1),
          maxPerOrder: z.number().min(1).max(100).optional(),
          sortOrder: z.number().optional(),
        })),
      }))
      .mutation(async ({ input }) => {
        // Delete existing ticket types for this event first
        await deleteTicketTypesByEventId(input.eventId);
        // Create new ticket types
        return await createTicketTypes(input.eventId, input.ticketTypes);
      }),
    
    update: publicProcedure
      .input(z.object({
        ticketTypeId: z.number(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        price: z.number().min(0).optional(),
        quantity: z.number().min(1).optional(),
        maxPerOrder: z.number().min(1).max(100).optional(),
        sortOrder: z.number().optional(),
        isActive: z.number().min(0).max(1).optional(),
      }))
      .mutation(async ({ input }) => {
        const { ticketTypeId, ...data } = input;
        return await updateTicketType(ticketTypeId, data);
      }),
    
    delete: publicProcedure
      .input(z.object({ ticketTypeId: z.number() }))
      .mutation(async ({ input }) => {
        const success = await deleteTicketType(input.ticketTypeId);
        return { success };
      }),
    
    checkAvailability: publicProcedure
      .input(z.object({
        ticketTypeId: z.number(),
        quantity: z.number().min(1),
      }))
      .query(async ({ input }) => {
        return await checkTicketTypeAvailability(input.ticketTypeId, input.quantity);
      }),
  }),

  // User registration and login (email/password)
  users: router({
    register: publicProcedure
      .input(z.object({
        username: z.string().min(3).max(50),
        email: z.string().email(),
        password: z.string().min(6),
      }))
      .mutation(async ({ input }) => {
        const result = await registerUser(input);
        if ("error" in result) return { success: false, error: result.error };
        return { success: true, user: { id: result.id, username: result.username, email: result.email } };
      }),

    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const user = await loginUser(input.email, input.password);
        if (!user) return { success: false, error: "Invalid email or password" };
        return { success: true, user: { id: user.id, username: user.username, email: user.email } };
      }),
  }),

  // User booking routes
  bookings: router({
    /**
     * Create a booking after a successful payment.
     * Validates availability, persists the row, updates sold counters,
     * and sends a confirmation email to the customer.
     */
    create: publicProcedure
      .input(
        z.object({
          userId: z.number(),
          userEmail: z.string().email(),
          eventId: z.number(),
          ticketTypeId: z.number().optional(),
          ticketTypeName: z.string().optional(),
          quantity: z.number().min(1),
          totalAmount: z.number().min(0), // cents
          paymentMethod: z.string(),
          transactionId: z.string(),
          qrCode: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const booking = await createBooking({
            userId: input.userId,
            eventId: input.eventId,
            ticketTypeId: input.ticketTypeId,
            ticketTypeName: input.ticketTypeName,
            quantity: input.quantity,
            totalAmount: input.totalAmount,
            paymentMethod: input.paymentMethod,
            transactionId: input.transactionId,
            qrCode: input.qrCode,
          });

          if (!booking) {
            return { success: false, error: "Failed to create booking" };
          }

          // Fetch event title for the confirmation email
          const event = await getEventById(input.eventId);
          if (event) {
            // Fire-and-forget — don't let email failure block the response
            sendBookingConfirmationEmail(
              input.userEmail,
              event.title,
              input.quantity,
              input.totalAmount,
              booking.id
            ).catch((err) =>
              console.error("[Email] Booking confirmation failed:", err)
            );
          }

          return { success: true, bookingId: booking.id };
        } catch (error: any) {
          console.error("[Router] createBooking error:", error);
          return { success: false, error: error.message ?? "Booking failed" };
        }
      }),

    /**
     * Fetch all bookings (with event details) for a given user.
     */
    getByUserId: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await getBookingsByUserId(input.userId);
      }),
  }),

  // Contact routes for users to reach organizers
  contact: router({
    getOrganizerByEvent: publicProcedure
      .input(z.object({ eventId: z.number() }))
      .query(async ({ input }) => {
        const organizer = await getOrganizerByEventId(input.eventId);
        if (!organizer) return null;
        // Return only public contact information
        return {
          companyName: organizer.companyName,
          contactEmail: organizer.contactEmail,
          contactPhone: organizer.contactPhone,
          website: organizer.website,
          bio: organizer.bio,
        };
      }),
  }),

  places: router({
    autocomplete: publicProcedure
      .input(z.object({ input: z.string(), country: z.string().default("za") }))
      .query(async ({ input }) => {
        const GOOGLE_PLACES_API_KEY = "AIzaSyCj1RvxSY3_mm5cgrEpvYo0MJC0RJ88skE";
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input.input)}&components=country:${input.country}&key=${GOOGLE_PLACES_API_KEY}`;
        const res = await fetch(url);
        return res.json();
      }),
    details: publicProcedure
      .input(z.object({ placeId: z.string() }))
      .query(async ({ input }) => {
        const GOOGLE_PLACES_API_KEY = "AIzaSyCj1RvxSY3_mm5cgrEpvYo0MJC0RJ88skE";
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${input.placeId}&fields=formatted_address,geometry,address_components&key=${GOOGLE_PLACES_API_KEY}`;
        const res = await fetch(url);
        return res.json();
      }),
  }),
});

export type AppRouter = typeof appRouter;


