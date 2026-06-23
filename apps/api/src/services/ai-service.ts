import { randomUUID } from "node:crypto";
import OpenAI from "openai";
import { z } from "zod";
import type {
  Activity,
  BudgetEstimate,
  GenerateTripInput,
  HotelSuggestion,
  ItineraryDay,
  TripPulse
} from "../types.js";

export interface GeneratedTrip {
  title: string;
  itinerary: ItineraryDay[];
  budget: BudgetEstimate;
  hotels: HotelSuggestion[];
  pulse: TripPulse;
  aiMode: "openai" | "local";
}

export interface AiService {
  generateTrip(input: GenerateTripInput): Promise<GeneratedTrip>;
  regenerateDay(
    input: GenerateTripInput,
    day: number,
    preference: string
  ): Promise<ItineraryDay>;
}

const activitySchema = z.object({
  time: z.string(),
  title: z.string(),
  description: z.string(),
  location: z.string(),
  durationMinutes: z.number().int().positive(),
  estimatedCost: z.number().nonnegative(),
  category: z.string()
});

const generatedTripSchema = z.object({
  title: z.string(),
  itinerary: z.array(
    z.object({
      day: z.number().int().positive(),
      title: z.string(),
      theme: z.string(),
      summary: z.string(),
      activities: z.array(activitySchema).min(2).max(6)
    })
  ),
  budget: z.object({
    currency: z.string(),
    flights: z.number().nonnegative(),
    accommodation: z.number().nonnegative(),
    food: z.number().nonnegative(),
    activities: z.number().nonnegative(),
    localTransport: z.number().nonnegative(),
    contingency: z.number().nonnegative(),
    total: z.number().nonnegative()
  }),
  hotels: z.array(
    z.object({
      name: z.string(),
      tier: z.enum(["Budget Friendly", "Mid Range", "Luxury"]),
      neighborhood: z.string(),
      nightlyEstimate: z.number().nonnegative(),
      rating: z.number().min(1).max(5),
      highlight: z.string()
    })
  ),
  pulse: z.object({
    score: z.number().int().min(0).max(100),
    label: z.string(),
    recommendation: z.string(),
    daily: z.array(
      z.object({
        day: z.number().int().positive(),
        energy: z.number().int().min(0).max(100),
        pace: z.enum(["Relaxed", "Balanced", "Packed"]),
        note: z.string()
      })
    )
  })
});

const responseJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "itinerary", "budget", "hotels", "pulse"],
  properties: {
    title: { type: "string" },
    itinerary: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["day", "title", "theme", "summary", "activities"],
        properties: {
          day: { type: "integer" },
          title: { type: "string" },
          theme: { type: "string" },
          summary: { type: "string" },
          activities: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: [
                "time",
                "title",
                "description",
                "location",
                "durationMinutes",
                "estimatedCost",
                "category"
              ],
              properties: {
                time: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                location: { type: "string" },
                durationMinutes: { type: "integer" },
                estimatedCost: { type: "number" },
                category: { type: "string" }
              }
            }
          }
        }
      }
    },
    budget: {
      type: "object",
      additionalProperties: false,
      required: [
        "currency",
        "flights",
        "accommodation",
        "food",
        "activities",
        "localTransport",
        "contingency",
        "total"
      ],
      properties: {
        currency: { type: "string" },
        flights: { type: "number" },
        accommodation: { type: "number" },
        food: { type: "number" },
        activities: { type: "number" },
        localTransport: { type: "number" },
        contingency: { type: "number" },
        total: { type: "number" }
      }
    },
    hotels: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "tier", "neighborhood", "nightlyEstimate", "rating", "highlight"],
        properties: {
          name: { type: "string" },
          tier: { type: "string", enum: ["Budget Friendly", "Mid Range", "Luxury"] },
          neighborhood: { type: "string" },
          nightlyEstimate: { type: "number" },
          rating: { type: "number" },
          highlight: { type: "string" }
        }
      }
    },
    pulse: {
      type: "object",
      additionalProperties: false,
      required: ["score", "label", "recommendation", "daily"],
      properties: {
        score: { type: "integer" },
        label: { type: "string" },
        recommendation: { type: "string" },
        daily: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["day", "energy", "pace", "note"],
            properties: {
              day: { type: "integer" },
              energy: { type: "integer" },
              pace: { type: "string", enum: ["Relaxed", "Balanced", "Packed"] },
              note: { type: "string" }
            }
          }
        }
      }
    }
  }
} as const;

const withIds = (result: z.infer<typeof generatedTripSchema>, aiMode: "openai" | "local") => ({
  ...result,
  itinerary: result.itinerary.map((day) => ({
    ...day,
    activities: day.activities.map((activity) => ({ ...activity, id: randomUUID() }))
  })),
  hotels: result.hotels.map((hotel) => ({ ...hotel, id: randomUUID() })),
  aiMode
});

const interestIdeas: Record<string, Array<[string, string, string]>> = {
  food: [
    ["09:00", "Market breakfast trail", "Local market"],
    ["13:00", "Neighborhood tasting lunch", "Old town"],
    ["19:00", "Chef-led regional dinner", "Dining district"]
  ],
  culture: [
    ["09:30", "Landmark and heritage walk", "Historic quarter"],
    ["14:00", "Museum deep dive", "Cultural district"],
    ["18:30", "Local performance", "Arts quarter"]
  ],
  adventure: [
    ["08:00", "Scenic outdoor expedition", "Nature reserve"],
    ["14:30", "Guided active experience", "Adventure district"],
    ["18:00", "Sunset viewpoint", "Panorama point"]
  ],
  shopping: [
    ["10:00", "Independent makers route", "Design district"],
    ["14:00", "Local shopping streets", "City center"],
    ["17:30", "Artisan souvenir stop", "Craft quarter"]
  ],
  nature: [
    ["08:30", "Botanical morning walk", "City gardens"],
    ["13:30", "Landscape escape", "Outer district"],
    ["18:00", "Golden-hour viewpoint", "Lookout"]
  ]
};

const money = (value: number) => Math.round(value);

export class LocalAiService implements AiService {
  async generateTrip(input: GenerateTripInput): Promise<GeneratedTrip> {
    const multiplier = input.budgetType === "Low" ? 0.72 : input.budgetType === "High" ? 1.65 : 1;
    const activitiesPerDay = input.budgetType === "High" ? 4 : 3;
    const itinerary = Array.from({ length: input.days }, (_, index) => {
      const day = index + 1;
      const interest = input.interests[index % input.interests.length]?.toLowerCase() || "culture";
      const ideas = interestIdeas[interest] || interestIdeas.culture!;
      const activities: Activity[] = ideas.slice(0, activitiesPerDay).map((idea, activityIndex) => ({
        id: randomUUID(),
        time: idea[0],
        title: `${idea[1]} in ${input.destination}`,
        description: `A thoughtfully paced ${interest} experience selected for your ${input.budgetType.toLowerCase()} budget.`,
        location: `${idea[2]}, ${input.destination}`,
        durationMinutes: 90 + activityIndex * 30,
        estimatedCost: money((18 + activityIndex * 17) * multiplier),
        category: interest.charAt(0).toUpperCase() + interest.slice(1)
      }));
      return {
        day,
        title: day === 1 ? `First impressions of ${input.destination}` : `${interest} at your own rhythm`,
        theme: interest.charAt(0).toUpperCase() + interest.slice(1),
        summary: `A balanced day blending signature sights with ${interest}-focused local moments.`,
        activities
      };
    });

    const flights = money(420 * multiplier);
    const accommodation = money(input.days * 115 * multiplier);
    const food = money(input.days * 48 * multiplier);
    const activities = money(
      itinerary.flatMap((day) => day.activities).reduce((sum, activity) => sum + activity.estimatedCost, 0)
    );
    const localTransport = money(input.days * 18 * multiplier);
    const subtotal = flights + accommodation + food + activities + localTransport;
    const contingency = money(subtotal * 0.1);

    return {
      title: `${input.destination} — ${input.days} day escape`,
      itinerary,
      budget: {
        currency: "USD",
        flights,
        accommodation,
        food,
        activities,
        localTransport,
        contingency,
        total: subtotal + contingency
      },
      hotels: [
        ["The Local House", "Budget Friendly", 78, 4.3, "Walkable, social, and excellent value"],
        ["Atelier Hotel", "Mid Range", 156, 4.6, "Design-led comfort near the action"],
        ["The Grand Meridian", "Luxury", 325, 4.8, "Quiet luxury with destination views"]
      ].map(([name, tier, rate, rating, highlight], index) => ({
        id: randomUUID(),
        name: `${name} ${input.destination}`,
        tier: tier as HotelSuggestion["tier"],
        neighborhood: index === 0 ? "Old Town" : index === 1 ? "Central District" : "Waterfront",
        nightlyEstimate: money(Number(rate) * multiplier),
        rating: Number(rating),
        highlight: String(highlight)
      })),
      pulse: this.buildPulse(itinerary),
      aiMode: "local"
    };
  }

  async regenerateDay(input: GenerateTripInput, day: number, preference: string) {
    const generated = await this.generateTrip({
      ...input,
      interests: preference.toLowerCase().includes("outdoor")
        ? ["adventure", "nature"]
        : [...input.interests, preference.split(" ")[0] || "culture"]
    });
    return {
      ...generated.itinerary[(day - 1) % generated.itinerary.length]!,
      day,
      title: `Reimagined day ${day}`,
      summary: `Regenerated around your request: ${preference}`
    };
  }

  private buildPulse(itinerary: ItineraryDay[]): TripPulse {
    const daily = itinerary.map((day) => {
      const minutes = day.activities.reduce((sum, activity) => sum + activity.durationMinutes, 0);
      const energy = Math.min(96, 40 + day.activities.length * 9 + Math.round(minutes / 45));
      const pace = energy > 82 ? "Packed" : energy < 60 ? "Relaxed" : "Balanced";
      return {
        day: day.day,
        energy,
        pace: pace as "Relaxed" | "Balanced" | "Packed",
        note:
          pace === "Packed"
            ? "A full day—keep one activity flexible."
            : pace === "Relaxed"
              ? "Plenty of breathing room for spontaneous stops."
              : "A healthy mix of discovery and downtime."
      };
    });
    const average = Math.round(daily.reduce((sum, day) => sum + day.energy, 0) / daily.length);
    return {
      score: Math.max(0, 100 - Math.abs(68 - average)),
      label: average > 82 ? "High energy" : average < 58 ? "Easygoing" : "Beautifully balanced",
      recommendation:
        average > 82
          ? "Consider dropping one late-afternoon activity on your busiest day."
          : "Your itinerary leaves enough room to enjoy the unexpected.",
      daily
    };
  }
}

export class OpenAiService implements AiService {
  private client: OpenAI;
  private fallback = new LocalAiService();

  constructor(apiKey: string, private model: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateTrip(input: GenerateTripInput): Promise<GeneratedTrip> {
    try {
      const response = await this.client.responses.create({
        model: this.model,
        store: false,
        input: [
          {
            role: "system",
            content:
              "You are an expert travel designer. Create realistic, geographically coherent, safe, well-paced itineraries. Estimates are planning guidance, not live quotes. Return the exact requested structured output."
          },
          {
            role: "user",
            content: `Plan ${input.days} days in ${input.destination}. Budget: ${input.budgetType}. Interests: ${input.interests.join(", ")}. Notes: ${input.notes || "None"}. Include every day exactly once, three varied hotel tiers, a complete USD budget whose total equals its parts, and a Trip Pulse pacing analysis.`
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "travel_plan",
            strict: true,
            schema: responseJsonSchema
          }
        }
      });
      const parsed = generatedTripSchema.parse(JSON.parse(response.output_text));
      if (parsed.itinerary.length !== input.days) throw new Error("AI returned incorrect day count");
      return withIds(parsed, "openai");
    } catch (error) {
      console.error("OpenAI generation failed; using local planner.", error);
      return this.fallback.generateTrip(input);
    }
  }

  async regenerateDay(input: GenerateTripInput, day: number, preference: string) {
    const generated = await this.generateTrip({
      ...input,
      days: 1,
      notes: `${input.notes || ""}\nRegenerate day ${day}: ${preference}`
    });
    return { ...generated.itinerary[0]!, day };
  }
}

