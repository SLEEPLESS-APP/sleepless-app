import { describe, it, expect } from "vitest";
import {
  provinces,
  events,
  mockComments,
  getEventsForCity,
  getAllEvents,
  getEventById,
  getProvinceById,
} from "../data/mock-data";

describe("Mock Data", () => {
  describe("provinces", () => {
    it("should have 9 provinces", () => {
      expect(provinces).toHaveLength(9);
    });

    it("should have all South African provinces", () => {
      const provinceNames = provinces.map((p) => p.name);
      expect(provinceNames).toContain("Eastern Cape");
      expect(provinceNames).toContain("Freestate");
      expect(provinceNames).toContain("Gauteng");
      expect(provinceNames).toContain("KwaZulu-Natal");
      expect(provinceNames).toContain("Limpopo");
      expect(provinceNames).toContain("Mpumalanga");
      expect(provinceNames).toContain("Northern Cape");
      expect(provinceNames).toContain("North West");
      expect(provinceNames).toContain("Western Cape");
    });

    it("each province should have cities", () => {
      provinces.forEach((province) => {
        expect(province.cities.length).toBeGreaterThan(0);
      });
    });
  });

  describe("events", () => {
    it("should have events", () => {
      expect(events.length).toBeGreaterThan(0);
    });

    it("each event should have required fields", () => {
      events.forEach((event) => {
        expect(event.id).toBeDefined();
        expect(event.name).toBeDefined();
        expect(event.date).toBeDefined();
        expect(event.venue).toBeDefined();
        expect(event.time).toBeDefined();
        expect(event.lineup).toBeDefined();
        expect(event.posterUrl).toBeDefined();
        expect(event.cityId).toBeDefined();
      });
    });
  });

  describe("mockComments", () => {
    it("should have comments", () => {
      expect(mockComments.length).toBeGreaterThan(0);
    });

    it("each comment should have required fields", () => {
      mockComments.forEach((comment) => {
        expect(comment.id).toBeDefined();
        expect(comment.userId).toBeDefined();
        expect(comment.username).toBeDefined();
        expect(comment.likes).toBeGreaterThanOrEqual(0);
        expect(comment.comments).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe("getEventsForCity", () => {
    it("should return events for a valid city", () => {
      const joburgEvents = getEventsForCity("joburg");
      expect(joburgEvents.length).toBeGreaterThan(0);
      joburgEvents.forEach((event) => {
        expect(event.cityId).toBe("joburg");
      });
    });

    it("should return empty array for invalid city", () => {
      const noEvents = getEventsForCity("invalid-city");
      expect(noEvents).toHaveLength(0);
    });
  });

  describe("getAllEvents", () => {
    it("should return all events", () => {
      const allEvents = getAllEvents();
      expect(allEvents).toEqual(events);
    });
  });

  describe("getEventById", () => {
    it("should return event for valid id", () => {
      const event = getEventById("space-jam");
      expect(event).toBeDefined();
      expect(event?.name).toBe("Space Jam");
    });

    it("should return undefined for invalid id", () => {
      const event = getEventById("invalid-id");
      expect(event).toBeUndefined();
    });
  });

  describe("getProvinceById", () => {
    it("should return province for valid id", () => {
      const province = getProvinceById("gauteng");
      expect(province).toBeDefined();
      expect(province?.name).toBe("Gauteng");
    });

    it("should return undefined for invalid id", () => {
      const province = getProvinceById("invalid-id");
      expect(province).toBeUndefined();
    });
  });
});
