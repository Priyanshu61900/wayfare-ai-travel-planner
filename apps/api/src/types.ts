export type BudgetType = "Low" | "Medium" | "High";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  time: string;
  title: string;
  description: string;
  location: string;
  durationMinutes: number;
  estimatedCost: number;
  category: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  theme: string;
  summary: string;
  activities: Activity[];
}

export interface BudgetEstimate {
  currency: string;
  flights: number;
  accommodation: number;
  food: number;
  activities: number;
  localTransport: number;
  contingency: number;
  total: number;
}

export interface HotelSuggestion {
  id: string;
  name: string;
  tier: "Budget Friendly" | "Mid Range" | "Luxury";
  neighborhood: string;
  nightlyEstimate: number;
  rating: number;
  highlight: string;
}

export interface TripPulse {
  score: number;
  label: string;
  recommendation: string;
  daily: Array<{
    day: number;
    energy: number;
    pace: "Relaxed" | "Balanced" | "Packed";
    note: string;
  }>;
}

export interface TripRecord {
  id: string;
  userId: string;
  title: string;
  destination: string;
  days: number;
  budgetType: BudgetType;
  interests: string[];
  notes?: string;
  itinerary: ItineraryDay[];
  budget: BudgetEstimate;
  hotels: HotelSuggestion[];
  pulse: TripPulse;
  aiMode: "openai" | "local";
  createdAt: string;
  updatedAt: string;
}

export interface GenerateTripInput {
  destination: string;
  days: number;
  budgetType: BudgetType;
  interests: string[];
  notes?: string;
}

