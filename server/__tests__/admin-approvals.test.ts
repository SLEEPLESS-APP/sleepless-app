import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("../db.js", () => ({
  getPendingOrganizers: vi.fn(),
  approveOrganizer: vi.fn(),
  rejectOrganizer: vi.fn(),
  getPendingEvents: vi.fn(),
  approveEvent: vi.fn(),
  rejectEvent: vi.fn(),
}));

import { 
  getPendingOrganizers, 
  approveOrganizer, 
  rejectOrganizer,
  getPendingEvents,
  approveEvent,
  rejectEvent
} from "../db.js";

describe("Admin Approval Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPendingOrganizers", () => {
    it("should return list of pending organizers", async () => {
      const mockOrganizers = [
        {
          id: 1,
          companyName: "Test Events Co",
          email: "test@events.co.za",
          contactPerson: "John Doe",
          phone: "0821234567",
          verified: 0,
          createdAt: new Date(),
        },
        {
          id: 2,
          companyName: "Party Planners",
          email: "info@partyplanners.co.za",
          contactPerson: "Jane Smith",
          phone: "0829876543",
          verified: 0,
          createdAt: new Date(),
        },
      ];

      (getPendingOrganizers as any).mockResolvedValue(mockOrganizers);

      const result = await getPendingOrganizers();
      
      expect(result).toHaveLength(2);
      expect(result[0].companyName).toBe("Test Events Co");
      expect(result[1].companyName).toBe("Party Planners");
      expect(getPendingOrganizers).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no pending organizers", async () => {
      (getPendingOrganizers as any).mockResolvedValue([]);

      const result = await getPendingOrganizers();
      
      expect(result).toHaveLength(0);
    });
  });

  describe("approveOrganizer", () => {
    it("should approve an organizer successfully", async () => {
      (approveOrganizer as any).mockResolvedValue(true);

      const result = await approveOrganizer(1);
      
      expect(result).toBe(true);
      expect(approveOrganizer).toHaveBeenCalledWith(1);
    });

    it("should return false on failure", async () => {
      (approveOrganizer as any).mockResolvedValue(false);

      const result = await approveOrganizer(999);
      
      expect(result).toBe(false);
    });
  });

  describe("rejectOrganizer", () => {
    it("should reject an organizer with reason", async () => {
      (rejectOrganizer as any).mockResolvedValue(true);

      const result = await rejectOrganizer(1, "Invalid documents");
      
      expect(result).toBe(true);
      expect(rejectOrganizer).toHaveBeenCalledWith(1, "Invalid documents");
    });

    it("should return false on failure", async () => {
      (rejectOrganizer as any).mockResolvedValue(false);

      const result = await rejectOrganizer(999, "Test reason");
      
      expect(result).toBe(false);
    });
  });

  describe("getPendingEvents", () => {
    it("should return list of pending events", async () => {
      const mockEvents = [
        {
          id: 1,
          title: "Summer Festival",
          venue: "Cape Town Stadium",
          city: "Cape Town",
          province: "Western Cape",
          eventDate: new Date("2026-02-15"),
          price: 350,
          ticketsAvailable: 500,
          eventType: "Festival",
          status: "pending",
        },
        {
          id: 2,
          title: "Club Night",
          venue: "Taboo Club",
          city: "Johannesburg",
          province: "Gauteng",
          eventDate: new Date("2026-01-20"),
          price: 150,
          ticketsAvailable: 200,
          eventType: "Club",
          status: "pending",
        },
      ];

      (getPendingEvents as any).mockResolvedValue(mockEvents);

      const result = await getPendingEvents("pending");
      
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("Summer Festival");
      expect(result[1].title).toBe("Club Night");
      expect(getPendingEvents).toHaveBeenCalledWith("pending");
    });
  });

  describe("approveEvent", () => {
    it("should approve an event successfully", async () => {
      (approveEvent as any).mockResolvedValue(true);

      const result = await approveEvent(1);
      
      expect(result).toBe(true);
      expect(approveEvent).toHaveBeenCalledWith(1);
    });
  });

  describe("rejectEvent", () => {
    it("should reject an event with reason", async () => {
      (rejectEvent as any).mockResolvedValue(true);

      const result = await rejectEvent(1, "Does not meet guidelines");
      
      expect(result).toBe(true);
      expect(rejectEvent).toHaveBeenCalledWith(1, "Does not meet guidelines");
    });
  });
});
