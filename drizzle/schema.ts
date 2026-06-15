import { integer, pgEnum, pgTable, text, timestamp, varchar, serial } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const eventStatusEnum = pgEnum("event_status", ["draft", "pending", "approved", "rejected", "cancelled"]);
export const bookingStatusEnum = pgEnum("booking_status", ["pending", "confirmed", "cancelled", "refunded"]);
export const auditActionEnum = pgEnum("audit_action", ["approve", "reject", "edit", "delete"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  emailVerified: integer("emailVerified").default(0).notNull(),
  verificationToken: varchar("verificationToken", { length: 128 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const organizers = pgTable("organizers", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  contactEmail: varchar("contactEmail", { length: 255 }).notNull().unique(),
  contactPhone: varchar("contactPhone", { length: 50 }),
  website: varchar("website", { length: 255 }),
  bio: text("bio"),
  verified: integer("verified").default(0).notNull(),
  emailVerified: integer("emailVerified").default(0).notNull(),
  verificationToken: varchar("verificationToken", { length: 128 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  verificationDocs: text("verificationDocs"),
  socialLinks: text("socialLinks"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Organizer = typeof organizers.$inferSelect;
export type InsertOrganizer = typeof organizers.$inferInsert;

export const venues = pgTable("venues", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  province: varchar("province", { length: 100 }).notNull(),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  capacity: integer("capacity"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Venue = typeof venues.$inferSelect;
export type InsertVenue = typeof venues.$inferInsert;

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  organizerId: integer("organizerId").notNull(),
  venueId: integer("venueId"),
  venue: varchar("venue", { length: 255 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  province: varchar("province", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  posterUrl: varchar("posterUrl", { length: 500 }).notNull(),
  eventDate: timestamp("eventDate").notNull(),
  eventTime: varchar("eventTime", { length: 10 }).notNull(),
  eventType: varchar("eventType", { length: 50 }).notNull(),
  price: integer("price").notNull(),
  ticketsAvailable: integer("ticketsAvailable").notNull(),
  ticketsSold: integer("ticketsSold").default(0).notNull(),
  views: integer("views").default(0).notNull(),
  status: eventStatusEnum("status").default("draft").notNull(),
  featured: integer("featured").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  eventId: integer("eventId").notNull(),
  ticketTypeId: integer("ticketTypeId"),
  ticketTypeName: varchar("ticketTypeName", { length: 100 }),
  quantity: integer("quantity").notNull(),
  totalAmount: integer("totalAmount").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }).notNull(),
  transactionId: varchar("transactionId", { length: 255 }).notNull(),
  qrCode: text("qrCode").notNull(),
  status: bookingStatusEnum("status").default("confirmed").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

export const auditLog = pgTable("auditLog", {
  id: serial("id").primaryKey(),
  adminId: integer("adminId").notNull(),
  adminName: varchar("adminName", { length: 255 }),
  action: auditActionEnum("action").notNull(),
  targetType: varchar("targetType", { length: 50 }).notNull(),
  targetId: integer("targetId").notNull(),
  eventId: integer("eventId"),
  reason: text("reason"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;

export const ticketTypes = pgTable("ticketTypes", {
  id: serial("id").primaryKey(),
  eventId: integer("eventId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull(),
  sold: integer("sold").default(0).notNull(),
  maxPerOrder: integer("maxPerOrder").default(10).notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  isActive: integer("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type TicketType = typeof ticketTypes.$inferSelect;
export type InsertTicketType = typeof ticketTypes.$inferInsert;

export const passwordResetTokens = pgTable("passwordResetTokens", {
  id: serial("id").primaryKey(),
  organizerId: integer("organizerId").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  used: integer("used").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;
