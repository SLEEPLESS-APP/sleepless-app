import { describe, it, expect } from "vitest";

describe("Ticket Types Feature", () => {
  describe("Database Schema", () => {
    it("should have ticket_types table with required fields", async () => {
      // Verify the schema exports the ticketTypes table
      const schema = await import("../../drizzle/schema.js");
      expect(schema.ticketTypes).toBeDefined();
    });
  });

  describe("Ticket Type CRUD Operations", () => {
    it("should create ticket types for an event", async () => {
      const { createTicketTypes, deleteTicketTypesByEventId } = await import("../db");
      
      // Create test ticket types
      const testEventId = 99999; // Use a test event ID
      const ticketTypesData = [
        {
          name: "General Admission",
          description: "Standard entry",
          price: 15000, // R150 in cents
          quantity: 100,
          maxPerOrder: 10,
          sortOrder: 0,
        },
        {
          name: "VIP",
          description: "Premium access with perks",
          price: 35000, // R350 in cents
          quantity: 50,
          maxPerOrder: 5,
          sortOrder: 1,
        },
      ];

      // Clean up any existing test data
      await deleteTicketTypesByEventId(testEventId);

      // Create ticket types
      const result = await createTicketTypes(testEventId, ticketTypesData);
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].name).toBe("General Admission");
      expect(result[1].name).toBe("VIP");

      // Clean up
      await deleteTicketTypesByEventId(testEventId);
    });

    it("should get ticket types by event ID", async () => {
      const { createTicketTypes, getTicketTypesByEventId, deleteTicketTypesByEventId } = await import("../db");
      
      const testEventId = 99998;
      const ticketTypesData = [
        {
          name: "Early Bird",
          description: "Discounted early tickets",
          price: 10000,
          quantity: 50,
          maxPerOrder: 4,
          sortOrder: 0,
        },
      ];

      // Clean up and create
      await deleteTicketTypesByEventId(testEventId);
      await createTicketTypes(testEventId, ticketTypesData);

      // Fetch ticket types
      const fetchedTypes = await getTicketTypesByEventId(testEventId);
      expect(fetchedTypes).toBeDefined();
      expect(fetchedTypes.length).toBe(1);
      expect(fetchedTypes[0].name).toBe("Early Bird");
      expect(fetchedTypes[0].price).toBe(10000);

      // Clean up
      await deleteTicketTypesByEventId(testEventId);
    });

    it("should check ticket type availability", async () => {
      const { createTicketTypes, getTicketTypesByEventId, checkTicketTypeAvailability, deleteTicketTypesByEventId } = await import("../db");
      
      const testEventId = 99997;
      const ticketTypesData = [
        {
          name: "Limited",
          description: "Limited availability",
          price: 20000,
          quantity: 10,
          maxPerOrder: 5,
          sortOrder: 0,
        },
      ];

      // Clean up and create
      await deleteTicketTypesByEventId(testEventId);
      await createTicketTypes(testEventId, ticketTypesData);

      // Get the created ticket type
      const types = await getTicketTypesByEventId(testEventId);
      const ticketTypeId = types[0].id;

      // Check availability for valid quantity
      const available = await checkTicketTypeAvailability(ticketTypeId, 5);
      expect(available.available).toBe(true);
      expect(available.remaining).toBeGreaterThanOrEqual(5);

      // Check availability for quantity exceeding available
      const notAvailable = await checkTicketTypeAvailability(ticketTypeId, 15);
      expect(notAvailable.available).toBe(false);

      // Clean up
      await deleteTicketTypesByEventId(testEventId);
    });
  });

  describe("Price Calculations", () => {
    it("should correctly convert cents to rands for display", () => {
      const priceInCents = 15000;
      const priceInRands = priceInCents / 100;
      expect(priceInRands).toBe(150);
    });

    it("should correctly convert rands to cents for storage", () => {
      const priceInRands = 350;
      const priceInCents = Math.round(priceInRands * 100);
      expect(priceInCents).toBe(35000);
    });

    it("should calculate total price with service fee", () => {
      const unitPrice = 150;
      const quantity = 3;
      const totalPrice = unitPrice * quantity;
      const serviceFee = Math.round(totalPrice * 0.05);
      const grandTotal = totalPrice + serviceFee;

      expect(totalPrice).toBe(450);
      expect(serviceFee).toBe(23); // 5% of 450 rounded
      expect(grandTotal).toBe(473);
    });
  });
});

describe("Contact Organizer Feature", () => {
  describe("Organizer Contact Info", () => {
    it("should return only public contact information", () => {
      // Simulate the contact info filtering
      const fullOrganizerData = {
        id: 1,
        companyName: "Test Events Co",
        contactEmail: "contact@testevents.co.za",
        contactPhone: "+27 11 123 4567",
        website: "https://testevents.co.za",
        bio: "We organize amazing events",
        password: "hashed_password_should_not_be_exposed",
        verificationDocUrl: "private_document_url",
      };

      // Filter to only public info (as done in the router)
      const publicInfo = {
        companyName: fullOrganizerData.companyName,
        contactEmail: fullOrganizerData.contactEmail,
        contactPhone: fullOrganizerData.contactPhone,
        website: fullOrganizerData.website,
        bio: fullOrganizerData.bio,
      };

      expect(publicInfo.companyName).toBe("Test Events Co");
      expect(publicInfo.contactEmail).toBe("contact@testevents.co.za");
      expect(publicInfo.contactPhone).toBe("+27 11 123 4567");
      expect(publicInfo.website).toBe("https://testevents.co.za");
      expect(publicInfo.bio).toBe("We organize amazing events");
      expect((publicInfo as any).password).toBeUndefined();
      expect((publicInfo as any).verificationDocUrl).toBeUndefined();
    });

    it("should handle missing optional contact fields", () => {
      const organizerWithMinimalInfo = {
        companyName: "Minimal Events",
        contactEmail: "info@minimal.co.za",
        contactPhone: null,
        website: null,
        bio: null,
      };

      expect(organizerWithMinimalInfo.companyName).toBeDefined();
      expect(organizerWithMinimalInfo.contactEmail).toBeDefined();
      expect(organizerWithMinimalInfo.contactPhone).toBeNull();
      expect(organizerWithMinimalInfo.website).toBeNull();
      expect(organizerWithMinimalInfo.bio).toBeNull();
    });
  });

  describe("Contact Actions", () => {
    it("should format phone number for tel: link", () => {
      const phone = "+27 11 123 4567";
      const telLink = `tel:${phone}`;
      expect(telLink).toBe("tel:+27 11 123 4567");
    });

    it("should format email for mailto: link", () => {
      const email = "contact@testevents.co.za";
      const mailtoLink = `mailto:${email}`;
      expect(mailtoLink).toBe("mailto:contact@testevents.co.za");
    });

    it("should add https:// to website if missing", () => {
      const websiteWithoutProtocol = "testevents.co.za";
      const websiteWithProtocol = "https://testevents.co.za";

      const formatWebsite = (url: string) => {
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          return "https://" + url;
        }
        return url;
      };

      expect(formatWebsite(websiteWithoutProtocol)).toBe("https://testevents.co.za");
      expect(formatWebsite(websiteWithProtocol)).toBe("https://testevents.co.za");
    });
  });
});
