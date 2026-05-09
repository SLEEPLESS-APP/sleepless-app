// Mock data for Sleepless app

export interface Province {
  id: string;
  name: string;
  cities: City[];
}

export interface City {
  id: string;
  name: string;
}

export type EventType = "club" | "festival" | "concert" | "pool-party" | "rooftop";

export interface Event {
  id: string;
  name: string;
  date: string;
  dateObj: Date; // For sorting and filtering
  venue: string;
  time: string;
  lineup: string[];
  posterUrl: string;
  cityId: string;
  type: EventType;
  price: number; // Price in ZAR
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  timestamp: string;
}

export const eventTypes: { id: EventType; label: string; icon: string }[] = [
  { id: "club", label: "Club Night", icon: "nightlife" },
  { id: "festival", label: "Festival", icon: "festival" },
  { id: "concert", label: "Concert", icon: "music-note" },
  { id: "pool-party", label: "Pool Party", icon: "pool" },
  { id: "rooftop", label: "Rooftop", icon: "deck" },
];

export const provinces: Province[] = [
  {
    id: "eastern-cape",
    name: "Eastern Cape",
    cities: [
      { id: "east-london", name: "East London" },
      { id: "port-elizabeth", name: "Port Elizabeth" },
      { id: "queens-town", name: "Queens Town" },
      { id: "grahamstown", name: "Grahamstown" },
      { id: "bedford", name: "Bedford" },
    ],
  },
  {
    id: "freestate",
    name: "Freestate",
    cities: [
      { id: "bloemfontein", name: "Bloemfontein" },
      { id: "welkom", name: "Welkom" },
      { id: "sasolburg", name: "Sasolburg" },
      { id: "kroonstad", name: "Kroonstad" },
      { id: "parys", name: "Parys" },
      { id: "bethlehem", name: "Bethlehem" },
    ],
  },
  {
    id: "gauteng",
    name: "Gauteng",
    cities: [
      { id: "joburg", name: "Joburg" },
      { id: "pretoria", name: "Pretoria" },
      { id: "roodepoort", name: "Roodepoort" },
      { id: "east-rand", name: "East Rand" },
      { id: "vereeniging", name: "Vereeniging" },
      { id: "krugersdorp", name: "Krugersdorp" },
    ],
  },
  {
    id: "kwazulu-natal",
    name: "KwaZulu-Natal",
    cities: [
      { id: "durban", name: "Durban" },
      { id: "pietermaritzburg", name: "Pietermaritzburg" },
      { id: "newcastle", name: "Newcastle" },
      { id: "richards-bay", name: "Richards Bay" },
      { id: "vryheid", name: "Vryheid" },
      { id: "margate", name: "Margate" },
    ],
  },
  {
    id: "limpopo",
    name: "Limpopo",
    cities: [
      { id: "polokwane", name: "Polokwane" },
      { id: "bela-bela", name: "Bela Bela" },
      { id: "lephalale", name: "Lephalale" },
      { id: "makhado", name: "Makhado" },
      { id: "thabazimbi", name: "Thabazimbi" },
      { id: "tzaneen", name: "Tzaneen" },
    ],
  },
  {
    id: "mpumalanga",
    name: "Mpumalanga",
    cities: [
      { id: "mbombela", name: "Mbombela" },
      { id: "witbank", name: "Witbank" },
      { id: "standerton", name: "Standerton" },
      { id: "piet-retief", name: "Piet Retief" },
      { id: "malalane", name: "Malalane" },
      { id: "ermelo", name: "Ermelo" },
    ],
  },
  {
    id: "northern-cape",
    name: "Northern Cape",
    cities: [
      { id: "kimberly", name: "Kimberly" },
      { id: "upington", name: "Upington" },
      { id: "springbok", name: "Springbok" },
      { id: "kuruman", name: "Kuruman" },
      { id: "alexander-bay", name: "Alexander Bay" },
      { id: "vosburg", name: "Vosburg" },
    ],
  },
  {
    id: "north-west",
    name: "North West",
    cities: [
      { id: "rustenburg", name: "Rustenburg" },
      { id: "klerksdorp", name: "Klerksdorp" },
      { id: "potchefstroom", name: "Potchefstroom" },
      { id: "brits", name: "Brits" },
      { id: "mahikeng", name: "Mahikeng" },
      { id: "vryburg", name: "Vryburg" },
    ],
  },
  {
    id: "western-cape",
    name: "Western Cape",
    cities: [
      { id: "cape-town", name: "Cape Town" },
      { id: "stellenbosch", name: "Stellenbosch" },
      { id: "overberg", name: "Overberg" },
      { id: "oudtshoorn", name: "Oudtshoorn" },
      { id: "mossel-bay", name: "Mossel Bay" },
      { id: "knysna", name: "Knysna" },
    ],
  },
];

export const events: Event[] = [
  {
    id: "space-jam",
    name: "Space Jam",
    date: "20 June 2025",
    dateObj: new Date(2025, 5, 20),
    venue: "Club Galaxy",
    time: "18h00 - 00:00",
    lineup: ["DJ Spinz", "Big Pluto", "MC Thunder"],
    posterUrl: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400",
    cityId: "joburg",
    type: "club",
    price: 150,
  },
  {
    id: "tropical-summer",
    name: "Tropical Summer Party",
    date: "25 June 2025",
    dateObj: new Date(2025, 5, 25),
    venue: "Beach House",
    time: "16h00 - 02:00",
    lineup: ["DJ Tropix", "Summer Vibes", "Island Beats"],
    posterUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400",
    cityId: "durban",
    type: "pool-party",
    price: 200,
  },
  {
    id: "urban-beats",
    name: "Urban Beats",
    date: "28 June 2025",
    dateObj: new Date(2025, 5, 28),
    venue: "The Underground",
    time: "21h00 - 04:00",
    lineup: ["MC Flow", "DJ Urban", "Beat Master"],
    posterUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
    cityId: "cape-town",
    type: "club",
    price: 180,
  },
  {
    id: "summer-beach",
    name: "Summer Beach Fest",
    date: "1 July 2025",
    dateObj: new Date(2025, 6, 1),
    venue: "Sunset Beach Club",
    time: "14h00 - 23:00",
    lineup: ["Beach Boys", "Wave Riders", "Sun Chasers"],
    posterUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400",
    cityId: "cape-town",
    type: "festival",
    price: 350,
  },
  {
    id: "pure-sounds",
    name: "Pure Sounds",
    date: "5 July 2025",
    dateObj: new Date(2025, 6, 5),
    venue: "Sound Factory",
    time: "20h00 - 03:00",
    lineup: ["Pure DJ", "Sound Wave", "Echo Chamber"],
    posterUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400",
    cityId: "pretoria",
    type: "concert",
    price: 250,
  },
  {
    id: "party-nyc",
    name: "NYC Club Night",
    date: "10 July 2025",
    dateObj: new Date(2025, 6, 10),
    venue: "Manhattan Club",
    time: "22h00 - 05:00",
    lineup: ["NYC Finest", "Club Kings", "Night Owls"],
    posterUrl: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400",
    cityId: "joburg",
    type: "club",
    price: 200,
  },
  {
    id: "neon-nights",
    name: "Neon Nights",
    date: "15 July 2025",
    dateObj: new Date(2025, 6, 15),
    venue: "Glow Lounge",
    time: "21h00 - 04:00",
    lineup: ["Neon DJ", "Glow Master", "Light Show"],
    posterUrl: "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=400",
    cityId: "bloemfontein",
    type: "club",
    price: 120,
  },
  {
    id: "bass-drop",
    name: "Bass Drop Festival",
    date: "20 July 2025",
    dateObj: new Date(2025, 6, 20),
    venue: "Arena Stadium",
    time: "15h00 - 00:00",
    lineup: ["Bass King", "Drop Zone", "Sub Woofer"],
    posterUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400",
    cityId: "east-london",
    type: "festival",
    price: 400,
  },
  {
    id: "skyline-sunset",
    name: "Skyline Sunset",
    date: "22 July 2025",
    dateObj: new Date(2025, 6, 22),
    venue: "Rooftop 54",
    time: "17h00 - 23:00",
    lineup: ["Sunset DJ", "Sky High", "Cloud Nine"],
    posterUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400",
    cityId: "joburg",
    type: "rooftop",
    price: 280,
  },
  {
    id: "pool-vibes",
    name: "Pool Vibes",
    date: "27 July 2025",
    dateObj: new Date(2025, 6, 27),
    venue: "Aqua Club",
    time: "12h00 - 20:00",
    lineup: ["Splash DJ", "Pool Party Crew", "Wet & Wild"],
    posterUrl: "https://images.unsplash.com/photo-1504680177321-2e6a879aac86?w=400",
    cityId: "durban",
    type: "pool-party",
    price: 180,
  },
];

export const mockComments: Comment[] = [
  {
    id: "1",
    userId: "user005",
    username: "User005",
    content: "Amazing night at Space Jam! 🎉",
    imageUrl: "https://images.unsplash.com/photo-1529543544277-750e0c8f9b7e?w=400",
    likes: 350,
    comments: 23,
    timestamp: "2h ago",
  },
  {
    id: "2",
    userId: "user012",
    username: "User012",
    content: "Can't wait for the next event!",
    imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400",
    likes: 128,
    comments: 15,
    timestamp: "4h ago",
  },
  {
    id: "3",
    userId: "user089",
    username: "User089",
    content: "Best vibes in the city!",
    imageUrl: "https://images.unsplash.com/photo-1504680177321-2e6a879aac86?w=400",
    likes: 89,
    comments: 7,
    timestamp: "6h ago",
  },
];

export interface EventFilters {
  types?: EventType[];
  minPrice?: number;
  maxPrice?: number;
  startDate?: Date;
  endDate?: Date;
}

export function getEventsForCity(cityId: string, filters?: EventFilters): Event[] {
  let filtered = events.filter((event) => event.cityId === cityId);
  return applyFilters(filtered, filters);
}

export function getAllEvents(filters?: EventFilters): Event[] {
  return applyFilters(events, filters);
}

function applyFilters(eventList: Event[], filters?: EventFilters): Event[] {
  if (!filters) return eventList;

  let filtered = [...eventList];

  // Filter by type
  if (filters.types && filters.types.length > 0) {
    filtered = filtered.filter((event) => filters.types!.includes(event.type));
  }

  // Filter by price range
  if (filters.minPrice !== undefined) {
    filtered = filtered.filter((event) => event.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter((event) => event.price <= filters.maxPrice!);
  }

  // Filter by date range
  if (filters.startDate) {
    filtered = filtered.filter((event) => event.dateObj >= filters.startDate!);
  }
  if (filters.endDate) {
    filtered = filtered.filter((event) => event.dateObj <= filters.endDate!);
  }

  return filtered;
}

export function getEventById(eventId: string): Event | undefined {
  return events.find((event) => event.id === eventId);
}

export function getProvinceById(provinceId: string): Province | undefined {
  return provinces.find((province) => province.id === provinceId);
}

export function getCityById(cityId: string): City | undefined {
  for (const province of provinces) {
    const city = province.cities.find((c) => c.id === cityId);
    if (city) return city;
  }
  return undefined;
}

export function getProvinceForCity(cityId: string): Province | undefined {
  return provinces.find((province) =>
    province.cities.some((city) => city.id === cityId)
  );
}

// Get events grouped by date for calendar view
export function getEventsByMonth(year: number, month: number): Map<number, Event[]> {
  const eventsByDay = new Map<number, Event[]>();
  
  events.forEach((event) => {
    if (event.dateObj.getFullYear() === year && event.dateObj.getMonth() === month) {
      const day = event.dateObj.getDate();
      const existing = eventsByDay.get(day) || [];
      eventsByDay.set(day, [...existing, event]);
    }
  });
  
  return eventsByDay;
}

// Get price range for display
export function getPriceRange(): { min: number; max: number } {
  const prices = events.map((e) => e.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}
