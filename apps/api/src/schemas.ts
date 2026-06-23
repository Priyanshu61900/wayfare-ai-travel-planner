import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().toLowerCase().email().max(160),
  password: z
    .string()
    .min(8)
    .max(72)
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[a-z]/, "Password must include a lowercase letter")
    .regex(/[0-9]/, "Password must include a number")
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1)
});

export const tripInputSchema = z.object({
  destination: z.string().trim().min(2).max(100),
  days: z.coerce.number().int().min(1).max(14),
  budgetType: z.enum(["Low", "Medium", "High"]),
  interests: z.array(z.string().trim().min(2).max(40)).min(1).max(8),
  notes: z.string().trim().max(500).optional()
});

export const updateTripSchema = z.object({
  title: z.string().trim().min(2).max(100)
});

export const addActivitySchema = z.object({
  day: z.number().int().positive(),
  activity: z.object({
    time: z.string().trim().min(1).max(20),
    title: z.string().trim().min(2).max(100),
    description: z.string().trim().min(2).max(300),
    location: z.string().trim().min(2).max(120),
    durationMinutes: z.number().int().min(15).max(720),
    estimatedCost: z.number().min(0).max(100000),
    category: z.string().trim().min(2).max(40)
  })
});

export const regenerateDaySchema = z.object({
  preference: z.string().trim().min(3).max(300)
});

