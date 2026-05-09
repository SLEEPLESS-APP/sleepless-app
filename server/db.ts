import { eq, and, sql, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { InsertUser, users, events, bookings, organizers, auditLog, passwordResetTokens, ticketTypes, InsertTicketType } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      _db = drizzle(pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

/**
 * Hash a password
 */
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a password against a hash
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Organizer login with email and password
 */
export async function loginOrganizer(email: string, password: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot login organizer: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(organizers)
      .where(eq(organizers.contactEmail, email))
      .limit(1);

    if (result.length === 0) {
      return null; // Organizer not found
    }

    const organizer = result[0];

    // Check if password is set
    if (!organizer.passwordHash) {
      return null; // Password not set
    }

    // Verify password
    const isValid = await verifyPassword(password, organizer.passwordHash);
    if (!isValid) {
      return null; // Invalid password
    }

    // Return organizer without password hash
    const { passwordHash, ...organizerData } = organizer;
    return organizerData;
  } catch (error) {
    console.error("[Database] Failed to login organizer:", error);
    return null;
  }
}

/**
 * Update organizer password
 */
export async function updateOrganizerPassword(organizerId: number, password: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update password: database not available");
    return false;
  }

  try {
    const passwordHash = await hashPassword(password);
    await db
      .update(organizers)
      .set({ passwordHash })
      .where(eq(organizers.id, organizerId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update organizer password:", error);
    return false;
  }
}

/**
 * Create a new organizer
 */
export async function createOrganizer(data: {
  companyName: string;
  email: string;
  phone?: string;
  website?: string;
  bio?: string;
  password?: string;
  verificationDocuments?: string;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create organizer: database not available");
    return null;
  }

  try {
    // Hash password if provided
    const passwordHash = data.password ? await hashPassword(data.password) : undefined;

    await db
      .insert(organizers)
      .values({
        userId: 0, // Default to 0 for independent organizer accounts
        companyName: data.companyName,
        contactEmail: data.email,
        contactPhone: data.phone,
        website: data.website,
        bio: data.bio,
        passwordHash,
        verificationDocs: data.verificationDocuments,
        verified: 0, // 0 = pending verification
      });

    console.log("[Database] Organizer inserted, fetching by email:", data.email);
    
    // Fetch the newly created organizer by email (which is unique)
    const [newOrganizer] = await db
      .select()
      .from(organizers)
      .where(eq(organizers.contactEmail, data.email))
      .limit(1);
    
    if (!newOrganizer) {
      console.error("[Database] Failed to fetch newly created organizer");
      throw new Error("Failed to create organizer: could not retrieve record");
    }
    
    console.log("[Database] Created organizer with ID:", newOrganizer.id);
    
    return newOrganizer || null;
  } catch (error) {
    console.error("[Database] Failed to create organizer:", error);
    return null;
  }
}

/**
 * Get event by ID
 */
export async function getEventById(eventId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get event: database not available");
    return null;
  }

  try {
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);
    
    return event || null;
  } catch (error) {
    console.error("[Database] Failed to get event:", error);
    return null;
  }
}

/**
 * Create a new event
 */
export async function createEvent(data: {
  organizerId: number;
  title: string;
  description: string;
  venue: string;
  address: string;
  city: string;
  province: string;
  posterUrl: string;
  eventDate: Date;
  eventTime: string;
  eventType: string;
  price: number;
  ticketsAvailable: number;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create event: database not available");
    return null;
  }

  try {
    const result = await db
      .insert(events)
      .values({
        organizerId: data.organizerId,
        venue: data.venue,
        address: data.address,
        city: data.city,
        province: data.province,
        title: data.title,
        description: data.description,
        posterUrl: data.posterUrl,
        eventDate: data.eventDate,
        eventTime: data.eventTime,
        eventType: data.eventType,
        price: data.price,
        ticketsAvailable: data.ticketsAvailable,
        status: "pending", // Requires admin approval
      });

    console.log("[Database] Event inserted, fetching by title and organizerId");
    
    // Fetch the newly created event by unique combination (organizerId + title + eventDate)
    const [newEvent] = await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.organizerId, data.organizerId),
          eq(events.title, data.title),
          eq(events.eventDate, data.eventDate)
        )
      )
      .orderBy(desc(events.createdAt))
      .limit(1);
    
    if (!newEvent) {
      console.error("[Database] Failed to fetch newly created event");
      return null;
    }
    
    console.log("[Database] Created event with ID:", newEvent.id);
    return newEvent;
  } catch (error) {
    console.error("[Database] Failed to create event:", error);
    return null;
  }
}

/**
 * Update an existing event
 */
export async function updateEvent(data: {
  id: number;
  organizerId: number;
  title: string;
  description: string;
  venue: string;
  address: string;
  city: string;
  province: string;
  posterUrl: string;
  eventDate: Date;
  eventTime: string;
  eventType: string;
  price: number;
  ticketsAvailable: number;
  status?: string;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update event: database not available");
    return null;
  }

  try {
    await db
      .update(events)
      .set({
        title: data.title,
        description: data.description,
        venue: data.venue,
        address: data.address,
        city: data.city,
        province: data.province,
        posterUrl: data.posterUrl,
        eventDate: data.eventDate,
        eventTime: data.eventTime,
        eventType: data.eventType,
        price: data.price,
        ticketsAvailable: data.ticketsAvailable,
        status: (data.status || "pending") as "draft" | "pending" | "approved" | "rejected" | "cancelled",
      })
      .where(and(eq(events.id, data.id), eq(events.organizerId, data.organizerId)));

    console.log("[Database] Updated event:", data.id);
    
    // Fetch and return the updated event
    const [updatedEvent] = await db
      .select()
      .from(events)
      .where(eq(events.id, data.id))
      .limit(1);
    
    return updatedEvent || null;
  } catch (error) {
    console.error("[Database] Failed to update event:", error);
    return null;
  }
}

/**
 * Increment event views counter
 */
export async function incrementEventViews(eventId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot increment views: database not available");
    return null;
  }

  try {
    await db
      .update(events)
      .set({ views: sql`${events.views} + 1` })
      .where(eq(events.id, eventId));

    console.log("[Database] Incremented views for event:", eventId);
    return true;
  } catch (error) {
    console.error("[Database] Failed to increment views:", error);
    return null;
  }
}

/**
 * Get organizer by email
 */
export async function getOrganizerByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get organizer: database not available");
    return null;
  }

  try {
    const [organizer] = await db
      .select()
      .from(organizers)
      .where(eq(organizers.contactEmail, email))
      .limit(1);

    return organizer || null;
  } catch (error) {
    console.error("[Database] Failed to get organizer by email:", error);
    return null;
  }
}

/**
 * Get pending organizers for admin approval
 */
export async function getPendingOrganizers() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get pending organizers: database not available");
    return [];
  }

  try {
    const pendingOrgs = await db
      .select()
      .from(organizers)
      .where(eq(organizers.verified, 0))
      .orderBy(desc(organizers.createdAt));
    return pendingOrgs;
  } catch (error) {
    console.error("[Database] Failed to get pending organizers:", error);
    return [];
  }
}

/**
 * Approve an organizer
 */
export async function approveOrganizer(organizerId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot approve organizer: database not available");
    return false;
  }

  try {
    await db
      .update(organizers)
      .set({ verified: 1 })
      .where(eq(organizers.id, organizerId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to approve organizer:", error);
    return false;
  }
}

/**
 * Reject an organizer
 */
export async function rejectOrganizer(organizerId: number, reason: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot reject organizer: database not available");
    return false;
  }

  try {
    // For now, we'll delete the organizer. In production, you might want to
    // keep the record and add a rejection reason field
    await db
      .delete(organizers)
      .where(eq(organizers.id, organizerId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to reject organizer:", error);
    return false;
  }
}

/**
 * Get organizer analytics
 */
export async function getOrganizerAnalytics(organizerId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get organizer analytics: database not available");
    return null;
  }

  try {
    // Get all events for organizer
    const organizerEvents = await db
      .select()
      .from(events)
      .where(eq(events.organizerId, organizerId));

    const activeEvents = organizerEvents.filter((e) => e.status === "approved").length;

    // Calculate total views
    const totalViews = organizerEvents.reduce((sum, e) => sum + (e.views || 0), 0);

    // Get all bookings for organizer's events
    const eventIds = organizerEvents.map((e) => e.id);
    let totalSales = 0;
    let totalRevenue = 0;

    if (eventIds.length > 0) {
      const allBookings = await db
        .select()
        .from(bookings)
        .where(sql`${bookings.eventId} IN (${sql.join(eventIds.map((id) => sql`${id}`), sql`, `)})`);

      totalSales = allBookings.reduce((sum, b) => sum + b.quantity, 0);
      totalRevenue = allBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    }

    // Calculate conversion rate (bookings / views * 100)
    const conversionRate = totalViews > 0 ? (totalSales / totalViews) * 100 : 0;

    return {
      activeEvents,
      totalSales,
      totalRevenue,
      totalViews,
      conversionRate,
      salesThisWeek: 0, // TODO: Calculate from date range
      salesThisMonth: 0, // TODO: Calculate from date range
    };
  } catch (error) {
    console.error("[Database] Failed to get organizer analytics:", error);
    return null;
  }
}

/**
 * Get organizer statistics
 */
export async function getOrganizerStats(organizerId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get organizer stats: database not available");
    return {
      activeEvents: 0,
      totalSales: 0,
      totalRevenue: 0,
    };
  }

  try {
    // Count active events (approved and not past)
    const activeEventsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(
        and(
          eq(events.organizerId, organizerId),
          eq(events.status, "approved"),
          sql`${events.eventDate} >= CURDATE()`
        )
      );

    const activeEvents = Number(activeEventsResult[0]?.count || 0);

    // Get total sales and revenue from bookings
    const salesResult = await db
      .select({
        totalSales: sql<number>`COALESCE(SUM(${bookings.quantity}), 0)`,
        totalRevenue: sql<number>`COALESCE(SUM(${bookings.totalAmount}), 0)`,
      })
      .from(bookings)
      .innerJoin(events, eq(bookings.eventId, events.id))
      .where(
        and(
          eq(events.organizerId, organizerId),
          eq(bookings.status, "confirmed")
        )
      );

    const totalSales = Number(salesResult[0]?.totalSales || 0);
    const totalRevenue = Number(salesResult[0]?.totalRevenue || 0);

    return {
      activeEvents,
      totalSales,
      totalRevenue, // in cents
    };
  } catch (error) {
    console.error("[Database] Failed to get organizer stats:", error);
    return {
      activeEvents: 0,
      totalSales: 0,
      totalRevenue: 0,
    };
  }
}

/**
 * Get admin dashboard metrics
 */
export async function getAdminMetrics() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get admin metrics: database not available");
    return {
      totalOrganizers: 0,
      pendingApprovals: 0,
      activeEvents: 0,
      platformRevenue: 0,
      totalBookings: 0,
      totalUsers: 0,
    };
  }

  try {
    const [organizersResult, eventsResult, bookingsResult, usersResult] = await Promise.all([
      db.select({ count: sql<number>`COUNT(*)` }).from(organizers),
      db.select({ 
        total: sql<number>`COUNT(*)`,
        pending: sql<number>`SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)`,
        approved: sql<number>`SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END)`
      }).from(events),
      db.select({ 
        count: sql<number>`COUNT(*)`,
        revenue: sql<number>`SUM(totalAmount)`
      }).from(bookings),
      db.select({ count: sql<number>`COUNT(*)` }).from(users),
    ]);

    return {
      totalOrganizers: Number(organizersResult[0]?.count || 0),
      pendingApprovals: Number(eventsResult[0]?.pending || 0),
      activeEvents: Number(eventsResult[0]?.approved || 0),
      platformRevenue: Number(bookingsResult[0]?.revenue || 0),
      totalBookings: Number(bookingsResult[0]?.count || 0),
      totalUsers: Number(usersResult[0]?.count || 0),
    };
  } catch (error) {
    console.error("[Database] Failed to get admin metrics:", error);
    return {
      totalOrganizers: 0,
      pendingApprovals: 0,
      activeEvents: 0,
      platformRevenue: 0,
      totalBookings: 0,
      totalUsers: 0,
    };
  }
}

/**
 * Get pending events for admin review
 */
export async function getPendingEvents(status: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get pending events: database not available");
    return [];
  }

  try {
    const query = db.select().from(events);
    
    if (status === "pending") {
      query.where(eq(events.status, "pending"));
    }
    
    const result = await query.orderBy(sql`${events.createdAt} DESC`);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get pending events:", error);
    return [];
  }
}

/**
 * Approve an event
 */
export async function approveEvent(eventId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot approve event: database not available");
    return false;
  }

  try {
    await db
      .update(events)
      .set({ status: "approved" })
      .where(eq(events.id, eventId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to approve event:", error);
    return false;
  }
}

/**
 * Reject an event
 */
export async function rejectEvent(eventId: number, reason: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot reject event: database not available");
    return false;
  }

  try {
    await db
      .update(events)
      .set({ status: "rejected" })
      .where(eq(events.id, eventId));
    // TODO: Send notification to organizer with rejection reason
    return true;
  } catch (error) {
    console.error("[Database] Failed to reject event:", error);
    return false;
  }
}

/**
 * Get bookings for a specific event
 */
export async function getEventBookings(eventId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get event bookings: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(bookings)
      .where(eq(bookings.eventId, eventId))
      .orderBy(sql`${bookings.createdAt} DESC`);

    return result;
  } catch (error) {
    console.error("[Database] Failed to get event bookings:", error);
    return [];
  }
}

/**
 * Log an admin action
 */
export async function logAdminAction(data: {
  adminId: number;
  adminName: string;
  action: "approve" | "reject" | "edit" | "delete";
  targetType: string;
  targetId: number;
  eventId?: number;
  reason?: string;
  metadata?: string;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot log admin action: database not available");
    return false;
  }

  try {
    await db.insert(auditLog).values({
      adminId: data.adminId,
      adminName: data.adminName,
      action: data.action,
      targetType: data.targetType,
      targetId: data.targetId,
      eventId: data.eventId,
      reason: data.reason,
      metadata: data.metadata,
    });
    return true;
  } catch (error) {
    console.error("[Database] Failed to log admin action:", error);
    return false;
  }
}

/**
 * Get audit log entries
 */
export async function getAuditLog(limit: number = 100) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get audit log: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(auditLog)
      .orderBy(sql`${auditLog.createdAt} DESC`)
      .limit(limit);

    return result;
  } catch (error) {
    console.error("[Database] Failed to get audit log:", error);
    return [];
  }
}

/**
 * Get all events for an organizer
 */
export async function getOrganizerEvents(organizerId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get organizer events: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(events)
      .where(eq(events.organizerId, organizerId))
      .orderBy(sql`${events.eventDate} DESC`);

    return result;
  } catch (error) {
    console.error("[Database] Failed to get organizer events:", error);
    return [];
  }
}

/**
 * Create password reset token
 */
export async function createPasswordResetToken(organizerId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create reset token: database not available");
    return null;
  }

  try {
    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    await db.insert(passwordResetTokens).values({
      organizerId,
      token,
      expiresAt,
    });

    return token;
  } catch (error) {
    console.error("[Database] Failed to create reset token:", error);
    return null;
  }
}

/**
 * Get password reset token
 */
export async function getPasswordResetToken(token: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get reset token: database not available");
    return null;
  }

  try {
    const [result] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token))
      .limit(1);

    return result || null;
  } catch (error) {
    console.error("[Database] Failed to get reset token:", error);
    return null;
  }
}

/**
 * Mark token as used
 */
export async function markTokenAsUsed(tokenId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot mark token as used: database not available");
    return false;
  }

  try {
    await db
      .update(passwordResetTokens)
      .set({ used: 1 })
      .where(eq(passwordResetTokens.id, tokenId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to mark token as used:", error);
    return false;
  }
}


// ==================== TICKET TYPES ====================

/**
 * Get all ticket types for an event
 */
export async function getTicketTypesByEventId(eventId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get ticket types: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(ticketTypes)
      .where(eq(ticketTypes.eventId, eventId))
      .orderBy(ticketTypes.sortOrder);
    
    return result;
  } catch (error) {
    console.error("[Database] Failed to get ticket types:", error);
    return [];
  }
}

/**
 * Get a single ticket type by ID
 */
export async function getTicketTypeById(ticketTypeId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get ticket type: database not available");
    return null;
  }

  try {
    const [result] = await db
      .select()
      .from(ticketTypes)
      .where(eq(ticketTypes.id, ticketTypeId))
      .limit(1);
    
    return result || null;
  } catch (error) {
    console.error("[Database] Failed to get ticket type:", error);
    return null;
  }
}

/**
 * Create a new ticket type for an event
 */
export async function createTicketType(data: {
  eventId: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  maxPerOrder?: number;
  sortOrder?: number;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create ticket type: database not available");
    return null;
  }

  try {
    await db.insert(ticketTypes).values({
      eventId: data.eventId,
      name: data.name,
      description: data.description || null,
      price: data.price,
      quantity: data.quantity,
      maxPerOrder: data.maxPerOrder || 10,
      sortOrder: data.sortOrder || 0,
      isActive: 1,
    });

    // Fetch the newly created ticket type
    const [newTicketType] = await db
      .select()
      .from(ticketTypes)
      .where(
        and(
          eq(ticketTypes.eventId, data.eventId),
          eq(ticketTypes.name, data.name)
        )
      )
      .orderBy(desc(ticketTypes.createdAt))
      .limit(1);

    return newTicketType || null;
  } catch (error) {
    console.error("[Database] Failed to create ticket type:", error);
    return null;
  }
}

/**
 * Create multiple ticket types for an event at once
 */
export async function createTicketTypes(eventId: number, ticketTypesData: Array<{
  name: string;
  description?: string;
  price: number;
  quantity: number;
  maxPerOrder?: number;
  sortOrder?: number;
}>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create ticket types: database not available");
    return [];
  }

  try {
    const valuesToInsert = ticketTypesData.map((tt, index) => ({
      eventId,
      name: tt.name,
      description: tt.description || null,
      price: tt.price,
      quantity: tt.quantity,
      maxPerOrder: tt.maxPerOrder || 10,
      sortOrder: tt.sortOrder ?? index,
      isActive: 1,
    }));

    await db.insert(ticketTypes).values(valuesToInsert);

    // Fetch all ticket types for this event
    return await getTicketTypesByEventId(eventId);
  } catch (error) {
    console.error("[Database] Failed to create ticket types:", error);
    return [];
  }
}

/**
 * Update a ticket type
 */
export async function updateTicketType(ticketTypeId: number, data: {
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  maxPerOrder?: number;
  sortOrder?: number;
  isActive?: number;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update ticket type: database not available");
    return null;
  }

  try {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.maxPerOrder !== undefined) updateData.maxPerOrder = data.maxPerOrder;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    await db
      .update(ticketTypes)
      .set(updateData)
      .where(eq(ticketTypes.id, ticketTypeId));

    return await getTicketTypeById(ticketTypeId);
  } catch (error) {
    console.error("[Database] Failed to update ticket type:", error);
    return null;
  }
}

/**
 * Delete a ticket type
 */
export async function deleteTicketType(ticketTypeId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete ticket type: database not available");
    return false;
  }

  try {
    await db.delete(ticketTypes).where(eq(ticketTypes.id, ticketTypeId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete ticket type:", error);
    return false;
  }
}

/**
 * Delete all ticket types for an event
 */
export async function deleteTicketTypesByEventId(eventId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete ticket types: database not available");
    return false;
  }

  try {
    await db.delete(ticketTypes).where(eq(ticketTypes.eventId, eventId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete ticket types:", error);
    return false;
  }
}

/**
 * Update ticket type sold count (increment)
 */
export async function incrementTicketTypeSold(ticketTypeId: number, quantity: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update ticket type sold: database not available");
    return false;
  }

  try {
    await db
      .update(ticketTypes)
      .set({
        sold: sql`${ticketTypes.sold} + ${quantity}`,
      })
      .where(eq(ticketTypes.id, ticketTypeId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update ticket type sold:", error);
    return false;
  }
}

/**
 * Check if ticket type has available tickets
 */
export async function checkTicketTypeAvailability(ticketTypeId: number, requestedQuantity: number) {
  const ticketType = await getTicketTypeById(ticketTypeId);
  if (!ticketType) {
    return { available: false, reason: "Ticket type not found" };
  }

  if (!ticketType.isActive) {
    return { available: false, reason: "Ticket type is not available" };
  }

  const remaining = ticketType.quantity - ticketType.sold;
  if (remaining < requestedQuantity) {
    return { available: false, reason: `Only ${remaining} tickets remaining`, remaining };
  }

  if (requestedQuantity > ticketType.maxPerOrder) {
    return { available: false, reason: `Maximum ${ticketType.maxPerOrder} tickets per order`, maxPerOrder: ticketType.maxPerOrder };
  }

  return { available: true, ticketType, remaining };
}

/**
 * Get organizer contact info for an event
 */
export async function getOrganizerByEventId(eventId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get organizer: database not available");
    return null;
  }

  try {
    // First get the event to find organizerId
    const event = await getEventById(eventId);
    if (!event) {
      return null;
    }

    // Then get the organizer
    const [organizer] = await db
      .select({
        id: organizers.id,
        companyName: organizers.companyName,
        contactEmail: organizers.contactEmail,
        contactPhone: organizers.contactPhone,
        website: organizers.website,
        bio: organizers.bio,
        socialLinks: organizers.socialLinks,
      })
      .from(organizers)
      .where(eq(organizers.id, event.organizerId))
      .limit(1);

    return organizer || null;
  } catch (error) {
    console.error("[Database] Failed to get organizer by event:", error);
    return null;
  }
}

/**
 * Create a booking after successful payment.
 * Atomically checks availability, inserts the booking row,
 * and increments the sold counter on both the ticket type and the event.
 */
export async function createBooking(data: {
  userId: number;
  eventId: number;
  ticketTypeId?: number;
  ticketTypeName?: string;
  quantity: number;
  totalAmount: number; // in cents
  paymentMethod: string;
  transactionId: string;
  qrCode: string;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create booking: database not available");
    return null;
  }

  try {
    // 1. Re-check ticket availability inside the same connection to guard against races
    if (data.ticketTypeId) {
      const availability = await checkTicketTypeAvailability(data.ticketTypeId, data.quantity);
      if (!availability.available) {
        throw new Error(availability.reason ?? "Tickets no longer available");
      }
    } else {
      // Fall back to event-level availability
      const [event] = await db
        .select({ ticketsAvailable: events.ticketsAvailable, ticketsSold: events.ticketsSold })
        .from(events)
        .where(eq(events.id, data.eventId))
        .limit(1);
      if (!event) throw new Error("Event not found");
      const remaining = event.ticketsAvailable - event.ticketsSold;
      if (remaining < data.quantity) {
        throw new Error(`Only ${remaining} ticket(s) remaining`);
      }
    }

    // 2. Insert booking row
    await db.insert(bookings).values({
      userId: data.userId,
      eventId: data.eventId,
      ticketTypeId: data.ticketTypeId ?? null,
      ticketTypeName: data.ticketTypeName ?? null,
      quantity: data.quantity,
      totalAmount: data.totalAmount,
      paymentMethod: data.paymentMethod,
      transactionId: data.transactionId,
      qrCode: data.qrCode,
      status: "confirmed",
    });

    // 3. Retrieve the new booking by transactionId (unique per payment)
    const [newBooking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.transactionId, data.transactionId))
      .limit(1);

    if (!newBooking) {
      throw new Error("Booking inserted but could not be retrieved");
    }

    // 4. Increment sold counters
    if (data.ticketTypeId) {
      await incrementTicketTypeSold(data.ticketTypeId, data.quantity);
    }
    await db
      .update(events)
      .set({ ticketsSold: sql`${events.ticketsSold} + ${data.quantity}` })
      .where(eq(events.id, data.eventId));

    console.log("[Database] Created booking with ID:", newBooking.id);
    return newBooking;
  } catch (error) {
    console.error("[Database] Failed to create booking:", error);
    throw error; // re-throw so the tRPC layer can return a meaningful error
  }
}

/**
 * Get all bookings for a specific user.
 */
export async function getBookingsByUserId(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get bookings: database not available");
    return [];
  }

  try {
    const results = await db
      .select({
        id: bookings.id,
        eventId: bookings.eventId,
        ticketTypeId: bookings.ticketTypeId,
        ticketTypeName: bookings.ticketTypeName,
        quantity: bookings.quantity,
        totalAmount: bookings.totalAmount,
        paymentMethod: bookings.paymentMethod,
        transactionId: bookings.transactionId,
        qrCode: bookings.qrCode,
        status: bookings.status,
        createdAt: bookings.createdAt,
        // Join event details for display
        eventTitle: events.title,
        eventDate: events.eventDate,
        eventTime: events.eventTime,
        eventVenue: events.venue,
        eventCity: events.city,
        eventPosterUrl: events.posterUrl,
      })
      .from(bookings)
      .innerJoin(events, eq(bookings.eventId, events.id))
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));

    return results;
  } catch (error) {
    console.error("[Database] Failed to get user bookings:", error);
    return [];
  }
}

/**
 * Admin authentication — DB-backed.
 *
 * On first run the table has no admin row. Call seedAdminAccount() once
 * (via a migration script or a one-time API call) to create it.
 * Subsequent logins compare the supplied password against the stored bcrypt hash.
 */

// Admins table — separate from organizers so credentials are fully isolated.
// The table is defined inline here; run the companion migration to create it.
export async function loginAdmin(email: string, password: string): Promise<{ id: number; email: string } | null> {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const res = await pool.query(
      "SELECT id, email, password_hash FROM admin_accounts WHERE email = $1 LIMIT 1",
      [email]
    );
    const row = res.rows[0];
    if (!row) return null;
    const match = await bcrypt.compare(password, row.password_hash);
    if (!match) return null;
    return { id: row.id, email: row.email };
  } catch (error) {
    console.error("[Database] Admin login error:", error);
    return null;
  }
}

/**
 * One-time seed — creates the admin account if it does not exist.
 */
export async function seedAdminAccount(email: string, password: string): Promise<boolean> {
  const connStr = process.env.DATABASE_URL;
  console.log("[Seed] DATABASE_URL present:", !!connStr);
  if (!connStr) return false;

  let pool: Pool | null = null;
  try {
    pool = new Pool({ connectionString: connStr, ssl: { rejectUnauthorized: false } });

    // Create table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_accounts (
        id SERIAL PRIMARY KEY,
        email VARCHAR(320) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("[Seed] Table created/verified");

    // Insert admin
    const hash = await hashPassword(password);
    await pool.query(
      "INSERT INTO admin_accounts (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET password_hash = $2",
      [email, hash]
    );
    console.log("[Seed] Admin account seeded for:", email);
    return true;
  } catch (error: any) {
    console.error("[Seed] FAILED:", error?.message ?? error);
    return false;
  } finally {
    if (pool) await pool.end().catch(() => {});
  }
}

/**
 * User auth — email/password login and registration.
 * Stores users in a dedicated `app_users` table (separate from the OAuth `users` table).
 */
export async function registerUser(data: {
  username: string;
  email: string;
  password: string;
}): Promise<{ id: number; username: string; email: string } | { error: string }> {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(320) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    const existing = await pool.query("SELECT id FROM app_users WHERE email = $1 LIMIT 1", [data.email]);
    if (existing.rows.length > 0) return { error: "An account with this email already exists" };
    const hash = await hashPassword(data.password);
    await pool.query(
      "INSERT INTO app_users (username, email, password_hash) VALUES ($1, $2, $3)",
      [data.username, data.email, hash]
    );
    const res = await pool.query("SELECT id, username, email FROM app_users WHERE email = $1 LIMIT 1", [data.email]);
    const user = res.rows[0];
    if (!user) return { error: "Registration failed" };
    return user as { id: number; username: string; email: string };
  } catch (err: any) {
    console.error("[Database] registerUser error:", err);
    return { error: "Registration failed" };
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ id: number; username: string; email: string } | null> {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const res = await pool.query(
      "SELECT id, username, email, password_hash FROM app_users WHERE email = $1 LIMIT 1", [email]
    );
    const row = res.rows[0];
    if (!row) return null;
    const match = await bcrypt.compare(password, row.password_hash);
    if (!match) return null;
    return { id: row.id, username: row.username, email: row.email };
  } catch (err) {
    console.error("[Database] loginUser error:", err);
    return null;
  }
}

/**
 * Delete / cancel an event (organizer-owned).
 */
export async function deleteEvent(eventId: number, organizerId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  try {
    await db
      .update(events)
      .set({ status: "cancelled" })
      .where(and(eq(events.id, eventId), eq(events.organizerId, organizerId)));
    return true;
  } catch (err) {
    console.error("[Database] deleteEvent error:", err);
    return false;
  }
}

/**
 * Update organizer profile details.
 */
export async function updateOrganizerProfile(
  organizerId: number,
  data: {
    companyName?: string;
    contactPhone?: string;
    website?: string;
    bio?: string;
  }
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  try {
    await db
      .update(organizers)
      .set({
        ...(data.companyName  ? { companyName: data.companyName }   : {}),
        ...(data.contactPhone ? { contactPhone: data.contactPhone }  : {}),
        ...(data.website      ? { website: data.website }            : {}),
        ...(data.bio          ? { bio: data.bio }                    : {}),
      })
      .where(eq(organizers.id, organizerId));
    return true;
  } catch (err) {
    console.error("[Database] updateOrganizerProfile error:", err);
    return false;
  }
}
