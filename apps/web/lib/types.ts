export type BudgetType = "Low" | "Medium" | "High";

export interface User {
  id: string;
  name: string;
  email: string;
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

export interface Trip {
  id: string;
  userId: string;
  title: string;
  destination: string;
  days: number;
  budgetType: BudgetType;
  interests: string[];
  notes?: string;
  itinerary: ItineraryDay[];
  budget: {
    currency: string;
    flights: number;
    accommodation: number;
    food: number;
    activities: number;
    localTransport: number;
    contingency: number;
    total: number;
  };
  hotels: Array<{
    id: string;
    name: string;
    tier: "Budget Friendly" | "Mid Range" | "Luxury";
    neighborhood: string;
    nightlyEstimate: number;
    rating: number;
    highlight: string;
  }>;
  pulse: {
    score: number;
    label: string;
    recommendation: string;
    daily: Array<{
      day: number;
      energy: number;
      pace: "Relaxed" | "Balanced" | "Packed";
      note: string;
    }>;
  };
  aiMode: "openai" | "local";
  createdAt: string;
  updatedAt: string;
}

export interface TripInput {
  destination: string;
  days: number;
  budgetType: BudgetType;
  interests: string[];
  notes?: string;
}

