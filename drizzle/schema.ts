import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Organizers table - event organizers/promoters
export const organizers = mysqlTable("organizers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Links to users table
  companyName: varchar("companyName", { length: 255 }).notNull(),
  contactEmail: varchar("contactEmail", { length: 255 }).notNull().unique(),
  contactPhone: varchar("contactPhone", { length: 50 }),
  website: varchar("website", { length: 255 }),
  bio: text("bio"),
  verified: int("verified").default(0).notNull(), // 0 = pending, 1 = verified
  passwordHash: varchar("passwordHash", { length: 255 }), // For organizer login
  verificationDocs: text("verificationDocs"), // JSON array of document URLs
  socialLinks: text("socialLinks"), // JSON object with social media links
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Organizer = typeof organizers.$inferSelect;
export type InsertOrganizer = typeof organizers.$inferInsert;

// Venues table
export const venues = mysqlTable("venues", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  province: varchar("province", { length: 100 }).notNull(),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  capacity: int("capacity"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Venue = typeof venues.$inferSelect;
export type InsertVenue = typeof venues.$inferInsert;

// Events table
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  organizerId: int("organizerId").notNull(),
  venueId: int("venueId"),
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
  price: int("price").notNull(), // Price in cents (ZAR)
  ticketsAvailable: int("ticketsAvailable").notNull(),
  ticketsSold: int("ticketsSold").default(0).notNull(),
  views: int("views").default(0).notNull(),
  status: mysqlEnum("status", ["draft", "pending", "approved", "rejected", "cancelled"]).default("draft").notNull(),
  featured: int("featured").default(0).notNull(), // 0 = no, 1 = yes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

// Bookings table
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  eventId: int("eventId").notNull(),
  ticketTypeId: int("ticketTypeId"), // Optional - links to ticketTypes table
  ticketTypeName: varchar("ticketTypeName", { length: 100 }), // Stored for historical reference
  quantity: int("quantity").notNull(),
  totalAmount: int("totalAmount").notNull(), // Total in cents (ZAR)
  paymentMethod: varchar("paymentMethod", { length: 50 }).notNull(),
  transactionId: varchar("transactionId", { length: 255 }).notNull(),
  qrCode: text("qrCode").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled", "refunded"]).default("confirmed").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

// Audit log table - tracks admin actions
export const auditLog = mysqlTable("auditLog", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull(), // Links to users table
  adminName: varchar("adminName", { length: 255 }),
  action: mysqlEnum("action", ["approve", "reject", "edit", "delete"]).notNull(),
  targetType: varchar("targetType", { length: 50 }).notNull(), // "event", "organizer", etc.
  targetId: int("targetId").notNull(), // ID of the affected entity
  eventId: int("eventId"), // For event-related actions
  reason: text("reason"), // Optional reason for rejection, etc.
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;

// Ticket types table - multiple ticket options per event
export const ticketTypes = mysqlTable("ticketTypes", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  name: varchar("name", { length: 100 }).notNull(), // e.g., "General Admission", "VIP", "Table"
  description: text("description"), // Optional description of what's included
  price: int("price").notNull(), // Price in cents (ZAR)
  quantity: int("quantity").notNull(), // Total available
  sold: int("sold").default(0).notNull(), // Number sold
  maxPerOrder: int("maxPerOrder").default(10).notNull(), // Max tickets per order
  sortOrder: int("sortOrder").default(0).notNull(), // Display order
  isActive: int("isActive").default(1).notNull(), // 0 = hidden, 1 = visible
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TicketType = typeof ticketTypes.$inferSelect;
export type InsertTicketType = typeof ticketTypes.$inferInsert;

// Password reset tokens for organizers
export const passwordResetTokens = mysqlTable("passwordResetTokens", {
  id: int("id").autoincrement().primaryKey(),
  organizerId: int("organizerId").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  used: int("used").default(0).notNull(), // 0 = not used, 1 = used
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;
