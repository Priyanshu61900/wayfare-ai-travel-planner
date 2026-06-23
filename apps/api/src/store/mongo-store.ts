import mongoose, { Schema } from "mongoose";
import { randomUUID } from "node:crypto";
import { AppError } from "../lib/errors.js";
import type { TripRecord, UserRecord } from "../types.js";
import type { Store } from "./store.js";

const userSchema = new Schema(
  {
    _id: { type: String, default: randomUUID },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true, versionKey: false }
);

const tripSchema = new Schema(
  {
    _id: { type: String, default: randomUUID },
    userId: { type: String, required: true, index: true },
    title: String,
    destination: String,
    days: Number,
    budgetType: String,
    interests: [String],
    notes: String,
    itinerary: Schema.Types.Mixed,
    budget: Schema.Types.Mixed,
    hotels: Schema.Types.Mixed,
    pulse: Schema.Types.Mixed,
    aiMode: String
  },
  { timestamps: true, versionKey: false }
);
tripSchema.index({ userId: 1, updatedAt: -1 });

const UserModel =
  (mongoose.models.User as mongoose.Model<any> | undefined) ??
  mongoose.model<any>("User", userSchema);
const TripModel =
  (mongoose.models.Trip as mongoose.Model<any> | undefined) ??
  mongoose.model<any>("Trip", tripSchema);

const iso = (value: unknown) => new Date(value as string | number | Date).toISOString();
const mapUser = (doc: any): UserRecord => ({
  id: doc._id,
  name: doc.name,
  email: doc.email,
  passwordHash: doc.passwordHash,
  createdAt: iso(doc.createdAt)
});
const mapTrip = (doc: any): TripRecord => ({
  ...doc,
  id: doc._id,
  createdAt: iso(doc.createdAt),
  updatedAt: iso(doc.updatedAt)
});

export class MongoStore implements Store {
  constructor(private uri: string) {}

  async connect() {
    await mongoose.connect(this.uri);
  }

  async close() {
    await mongoose.disconnect();
  }

  async createUser(input: Omit<UserRecord, "id" | "createdAt">) {
    try {
      return mapUser((await UserModel.create(input)).toObject());
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new AppError(409, "EMAIL_EXISTS", "An account with this email already exists.");
      }
      throw error;
    }
  }

  async findUserByEmail(email: string) {
    const doc = await UserModel.findOne({ email }).lean();
    return doc ? mapUser(doc) : null;
  }

  async findUserById(id: string) {
    const doc = await UserModel.findById(id).lean();
    return doc ? mapUser(doc) : null;
  }

  async createTrip(input: Omit<TripRecord, "id" | "createdAt" | "updatedAt">) {
    return mapTrip((await TripModel.create(input)).toObject());
  }

  async listTrips(userId: string) {
    return (await TripModel.find({ userId }).sort({ updatedAt: -1 }).lean()).map(mapTrip);
  }

  async findTripById(id: string, userId: string) {
    const doc = await TripModel.findOne({ _id: id, userId }).lean();
    return doc ? mapTrip(doc) : null;
  }

  async updateTrip(trip: TripRecord) {
    const update: Partial<TripRecord> & {
      id?: string;
      createdAt?: string;
      updatedAt?: string;
    } = { ...trip };
    delete update.id;
    delete update.createdAt;
    delete update.updatedAt;
    const doc = await TripModel.findOneAndUpdate(
      { _id: trip.id, userId: trip.userId },
      { $set: update },
      { new: true }
    ).lean();
    if (!doc) throw new AppError(404, "TRIP_NOT_FOUND", "Trip not found.");
    return mapTrip(doc);
  }

  async deleteTrip(id: string, userId: string) {
    const result = await TripModel.deleteOne({ _id: id, userId });
    return result.deletedCount === 1;
  }
}
