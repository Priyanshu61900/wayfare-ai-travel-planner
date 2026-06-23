import { randomUUID } from "node:crypto";
import { AppError } from "../lib/errors.js";
import type { TripRecord, UserRecord } from "../types.js";
import type { Store } from "./store.js";

export class MemoryStore implements Store {
  private users = new Map<string, UserRecord>();
  private trips = new Map<string, TripRecord>();

  async connect() {}
  async close() {}

  async createUser(input: Omit<UserRecord, "id" | "createdAt">) {
    if ([...this.users.values()].some((user) => user.email === input.email)) {
      throw new AppError(409, "EMAIL_EXISTS", "An account with this email already exists.");
    }
    const user = { ...input, id: randomUUID(), createdAt: new Date().toISOString() };
    this.users.set(user.id, user);
    return structuredClone(user);
  }

  async findUserByEmail(email: string) {
    const user = [...this.users.values()].find((item) => item.email === email);
    return user ? structuredClone(user) : null;
  }

  async findUserById(id: string) {
    const user = this.users.get(id);
    return user ? structuredClone(user) : null;
  }

  async createTrip(input: Omit<TripRecord, "id" | "createdAt" | "updatedAt">) {
    const now = new Date().toISOString();
    const trip = { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
    this.trips.set(trip.id, trip);
    return structuredClone(trip);
  }

  async listTrips(userId: string) {
    return [...this.trips.values()]
      .filter((trip) => trip.userId === userId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((trip) => structuredClone(trip));
  }

  async findTripById(id: string, userId: string) {
    const trip = this.trips.get(id);
    return trip?.userId === userId ? structuredClone(trip) : null;
  }

  async updateTrip(trip: TripRecord) {
    const updated = { ...trip, updatedAt: new Date().toISOString() };
    this.trips.set(updated.id, structuredClone(updated));
    return updated;
  }

  async deleteTrip(id: string, userId: string) {
    const trip = this.trips.get(id);
    if (!trip || trip.userId !== userId) return false;
    return this.trips.delete(id);
  }
}

