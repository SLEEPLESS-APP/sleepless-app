import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { events } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Check if a duplicate event exists for the same organizer
 * A duplicate is defined as an event with the same title, venue, and date
 * that is not in 'rejected' or 'draft' status
 */
export async function checkDuplicateEvent(data: {
  organizerId: number;
  title: string;
  venue: string;
  eventDate: Date;
  excludeEventId?: number; // For edit mode, exclude the current event
}): Promise<{ isDuplicate: boolean; existingEvent?: any }> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot check duplicate: database not available");
    return { isDuplicate: false };
  }

  try {
    // Find events with same organizer, title, venue, and date
    const existingEvents = await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.organizerId, data.organizerId),
          eq(events.title, data.title),
          eq(events.venue, data.venue),
          eq(events.eventDate, data.eventDate)
        )
      );

    // Filter out rejected events and drafts (they can be resubmitted)
    // Also filter out the current event if we're editing
    const activeEvents = existingEvents.filter((event) => {
      if (data.excludeEventId && event.id === data.excludeEventId) {
        return false;
      }
      // Allow resubmission of rejected events
      if (event.status === "rejected") {
        return false;
      }
      return true;
    });

    if (activeEvents.length > 0) {
      return {
        isDuplicate: true,
        existingEvent: activeEvents[0],
      };
    }

    return { isDuplicate: false };
  } catch (error) {
    console.error("[Database] Failed to check duplicate event:", error);
    return { isDuplicate: false };
  }
}
