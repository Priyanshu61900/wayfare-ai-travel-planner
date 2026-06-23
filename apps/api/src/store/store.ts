import type { TripRecord, UserRecord } from "../types.js";

export interface Store {
  connect(): Promise<void>;
  close(): Promise<void>;
  createUser(input: Omit<UserRecord, "id" | "createdAt">): Promise<UserRecord>;
  findUserByEmail(email: string): Promise<UserRecord | null>;
  findUserById(id: string): Promise<UserRecord | null>;
  createTrip(input: Omit<TripRecord, "id" | "createdAt" | "updatedAt">): Promise<TripRecord>;
  listTrips(userId: string): Promise<TripRecord[]>;
  findTripById(id: string, userId: string): Promise<TripRecord | null>;
  updateTrip(trip: TripRecord): Promise<TripRecord>;
  deleteTrip(id: string, userId: string): Promise<boolean>;
}

