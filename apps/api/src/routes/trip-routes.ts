import { randomUUID } from "node:crypto";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../lib/async-handler.js";
import { AppError } from "../lib/errors.js";
import { requireAuth } from "../middleware/auth.js";
import {
  addActivitySchema,
  regenerateDaySchema,
  tripInputSchema,
  updateTripSchema
} from "../schemas.js";
import type { AiService } from "../services/ai-service.js";
import type { Store } from "../store/store.js";

const routeParam = (value: string | string[] | undefined) => {
  const resolved = Array.isArray(value) ? value[0] : value;
  if (!resolved) throw new AppError(400, "INVALID_ROUTE", "A required route parameter is missing.");
  return resolved;
};

export const tripRoutes = (store: Store, ai: AiService) => {
  const router = Router();
  router.use(requireAuth);

  const generationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 25,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    keyGenerator: (req) => req.userId!,
    message: { error: { code: "GENERATION_LIMIT", message: "Generation limit reached. Try again later." } }
  });

  router.get(
    "/",
    asyncHandler(async (req, res) => {
      res.json({ trips: await store.listTrips(req.userId!) });
    })
  );

  router.post(
    "/",
    generationLimiter,
    asyncHandler(async (req, res) => {
      const input = tripInputSchema.parse(req.body);
      const generated = await ai.generateTrip(input);
      const trip = await store.createTrip({
        userId: req.userId!,
        destination: input.destination,
        days: input.days,
        budgetType: input.budgetType,
        interests: input.interests,
        notes: input.notes,
        ...generated
      });
      res.status(201).json({ trip });
    })
  );

  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const trip = await store.findTripById(routeParam(req.params.id), req.userId!);
      if (!trip) throw new AppError(404, "TRIP_NOT_FOUND", "Trip not found.");
      res.json({ trip });
    })
  );

  router.patch(
    "/:id",
    asyncHandler(async (req, res) => {
      const input = updateTripSchema.parse(req.body);
      const trip = await store.findTripById(routeParam(req.params.id), req.userId!);
      if (!trip) throw new AppError(404, "TRIP_NOT_FOUND", "Trip not found.");
      res.json({ trip: await store.updateTrip({ ...trip, title: input.title }) });
    })
  );

  router.delete(
    "/:id",
    asyncHandler(async (req, res) => {
      const deleted = await store.deleteTrip(routeParam(req.params.id), req.userId!);
      if (!deleted) throw new AppError(404, "TRIP_NOT_FOUND", "Trip not found.");
      res.status(204).send();
    })
  );

  router.post(
    "/:id/activities",
    asyncHandler(async (req, res) => {
      const input = addActivitySchema.parse(req.body);
      const trip = await store.findTripById(routeParam(req.params.id), req.userId!);
      if (!trip) throw new AppError(404, "TRIP_NOT_FOUND", "Trip not found.");
      const day = trip.itinerary.find((item) => item.day === input.day);
      if (!day) throw new AppError(404, "DAY_NOT_FOUND", "Itinerary day not found.");
      day.activities.push({ ...input.activity, id: randomUUID() });
      res.json({ trip: await store.updateTrip(trip) });
    })
  );

  router.delete(
    "/:id/days/:day/activities/:activityId",
    asyncHandler(async (req, res) => {
      const trip = await store.findTripById(routeParam(req.params.id), req.userId!);
      if (!trip) throw new AppError(404, "TRIP_NOT_FOUND", "Trip not found.");
      const day = trip.itinerary.find((item) => item.day === Number(routeParam(req.params.day)));
      if (!day) throw new AppError(404, "DAY_NOT_FOUND", "Itinerary day not found.");
      const before = day.activities.length;
      day.activities = day.activities.filter(
        (activity) => activity.id !== routeParam(req.params.activityId)
      );
      if (before === day.activities.length) {
        throw new AppError(404, "ACTIVITY_NOT_FOUND", "Activity not found.");
      }
      res.json({ trip: await store.updateTrip(trip) });
    })
  );

  router.post(
    "/:id/days/:day/regenerate",
    generationLimiter,
    asyncHandler(async (req, res) => {
      const input = regenerateDaySchema.parse(req.body);
      const dayNumber = Number(routeParam(req.params.day));
      const trip = await store.findTripById(routeParam(req.params.id), req.userId!);
      if (!trip) throw new AppError(404, "TRIP_NOT_FOUND", "Trip not found.");
      if (!trip.itinerary.some((day) => day.day === dayNumber)) {
        throw new AppError(404, "DAY_NOT_FOUND", "Itinerary day not found.");
      }
      const regenerated = await ai.regenerateDay(
        {
          destination: trip.destination,
          days: trip.days,
          budgetType: trip.budgetType,
          interests: trip.interests,
          notes: trip.notes
        },
        dayNumber,
        input.preference
      );
      trip.itinerary = trip.itinerary.map((day) => (day.day === dayNumber ? regenerated : day));
      res.json({ trip: await store.updateTrip(trip) });
    })
  );

  return router;
};
