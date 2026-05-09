import { describe, it, expect } from "vitest";
import { calculateDistance, formatDistance, isWithinRadius, getCityCoordinates } from "../../lib/distance";

describe("Distance Calculation", () => {
  it("calculates distance between two coordinates correctly", () => {
    // Johannesburg to Pretoria (approximately 55-60 km)
    const johannesburg = { latitude: -26.2041, longitude: 28.0473 };
    const pretoria = { latitude: -25.7479, longitude: 28.2293 };
    
    const distance = calculateDistance(johannesburg, pretoria);
    
    // Should be approximately 55-60 km
    expect(distance).toBeGreaterThan(50);
    expect(distance).toBeLessThan(65);
  });

  it("calculates zero distance for same location", () => {
    const location = { latitude: -26.2041, longitude: 28.0473 };
    
    const distance = calculateDistance(location, location);
    
    expect(distance).toBe(0);
  });

  it("calculates distance between Cape Town and Johannesburg", () => {
    // Cape Town to Johannesburg (approximately 1265 km)
    const capeTown = { latitude: -33.9249, longitude: 18.4241 };
    const johannesburg = { latitude: -26.2041, longitude: 28.0473 };
    
    const distance = calculateDistance(capeTown, johannesburg);
    
    // Should be approximately 1260-1280 km
    expect(distance).toBeGreaterThan(1200);
    expect(distance).toBeLessThan(1350);
  });
});

describe("Distance Formatting", () => {
  it("formats distances less than 1 km in meters", () => {
    expect(formatDistance(0.5)).toBe("500 m");
    expect(formatDistance(0.1)).toBe("100 m");
    expect(formatDistance(0.75)).toBe("750 m");
  });

  it("formats distances between 1-10 km with one decimal", () => {
    expect(formatDistance(1.5)).toBe("1.5 km");
    expect(formatDistance(5.25)).toBe("5.3 km");
    expect(formatDistance(9.99)).toBe("10.0 km");
  });

  it("formats distances over 10 km as whole numbers", () => {
    expect(formatDistance(15.7)).toBe("16 km");
    expect(formatDistance(100.3)).toBe("100 km");
    expect(formatDistance(1265.5)).toBe("1266 km");
  });
});

describe("Radius Check", () => {
  it("returns true when point is within radius", () => {
    const center = { latitude: -26.2041, longitude: 28.0473 }; // Johannesburg
    const nearby = { latitude: -26.1076, longitude: 28.0567 }; // Sandton (~11 km)
    
    expect(isWithinRadius(center, nearby, 15)).toBe(true);
    expect(isWithinRadius(center, nearby, 20)).toBe(true);
  });

  it("returns false when point is outside radius", () => {
    const center = { latitude: -26.2041, longitude: 28.0473 }; // Johannesburg
    const pretoria = { latitude: -25.7479, longitude: 28.2293 }; // Pretoria (~55 km)
    
    expect(isWithinRadius(center, pretoria, 10)).toBe(false);
    expect(isWithinRadius(center, pretoria, 30)).toBe(false);
    expect(isWithinRadius(center, pretoria, 50)).toBe(false);
  });

  it("returns true when point is exactly at radius boundary", () => {
    const center = { latitude: -26.2041, longitude: 28.0473 };
    const pretoria = { latitude: -25.7479, longitude: 28.2293 };
    const distance = calculateDistance(center, pretoria);
    
    expect(isWithinRadius(center, pretoria, distance)).toBe(true);
  });
});

describe("City Coordinates Lookup", () => {
  it("returns coordinates for known cities", () => {
    const johannesburg = getCityCoordinates("Johannesburg");
    expect(johannesburg).not.toBeNull();
    expect(johannesburg?.latitude).toBeCloseTo(-26.2041, 1);
    expect(johannesburg?.longitude).toBeCloseTo(28.0473, 1);

    const capeTown = getCityCoordinates("Cape Town");
    expect(capeTown).not.toBeNull();
    expect(capeTown?.latitude).toBeCloseTo(-33.9249, 1);
  });

  it("returns null for unknown cities", () => {
    expect(getCityCoordinates("Unknown City")).toBeNull();
    expect(getCityCoordinates("")).toBeNull();
  });

  it("has coordinates for major South African cities", () => {
    const majorCities = [
      "Johannesburg",
      "Cape Town",
      "Durban",
      "Pretoria",
      "Port Elizabeth",
      "Bloemfontein",
    ];

    majorCities.forEach((city) => {
      const coords = getCityCoordinates(city);
      expect(coords).not.toBeNull();
      expect(coords?.latitude).toBeLessThan(0); // South of equator
      expect(coords?.longitude).toBeGreaterThan(0); // East of prime meridian
    });
  });
});
