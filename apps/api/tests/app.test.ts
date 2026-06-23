import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { LocalAiService } from "../src/services/ai-service.js";
import { MemoryStore } from "../src/store/memory-store.js";

const userA = { name: "Ava Explorer", email: "ava@example.com", password: "Voyage123" };
const userB = { name: "Noah Nomad", email: "noah@example.com", password: "Journey123" };
const tripInput = {
  destination: "Kyoto",
  days: 3,
  budgetType: "Medium",
  interests: ["Food", "Culture"]
};

describe("Wayfare API", () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp(new MemoryStore(), new LocalAiService());
  });

  it("registers, authenticates, and returns the current user", async () => {
    const agent = request.agent(app);
    const registered = await agent.post("/api/auth/register").send(userA).expect(201);
    expect(registered.body.user.email).toBe(userA.email);
    const me = await agent.get("/api/auth/me").expect(200);
    expect(me.body.user.name).toBe(userA.name);
  });

  it("creates a complete itinerary and supports edits", async () => {
    const agent = request.agent(app);
    await agent.post("/api/auth/register").send(userA).expect(201);
    const created = await agent.post("/api/trips").send(tripInput).expect(201);
    expect(created.body.trip.itinerary).toHaveLength(3);
    expect(created.body.trip.hotels).toHaveLength(3);
    expect(created.body.trip.budget.total).toBeGreaterThan(0);
    expect(created.body.trip.pulse.daily).toHaveLength(3);

    const trip = created.body.trip;
    const activity = trip.itinerary[0].activities[0];
    const updated = await agent
      .delete(`/api/trips/${trip.id}/days/1/activities/${activity.id}`)
      .expect(200);
    expect(updated.body.trip.itinerary[0].activities).toHaveLength(
      trip.itinerary[0].activities.length - 1
    );

    const regenerated = await agent
      .post(`/api/trips/${trip.id}/days/2/regenerate`)
      .send({ preference: "More outdoor activities and fewer museums" })
      .expect(200);
    expect(regenerated.body.trip.itinerary[1].summary).toContain("Regenerated");
  });

  it("enforces strict trip ownership", async () => {
    const first = request.agent(app);
    const second = request.agent(app);
    await first.post("/api/auth/register").send(userA).expect(201);
    await second.post("/api/auth/register").send(userB).expect(201);
    const created = await first.post("/api/trips").send(tripInput).expect(201);

    await second.get(`/api/trips/${created.body.trip.id}`).expect(404);
    await second.patch(`/api/trips/${created.body.trip.id}`).send({ title: "Stolen" }).expect(404);
    await second.delete(`/api/trips/${created.body.trip.id}`).expect(404);
  });

  it("rejects invalid input and unauthenticated access", async () => {
    await request(app).get("/api/trips").expect(401);
    const agent = request.agent(app);
    await agent.post("/api/auth/register").send(userA).expect(201);
    await agent.post("/api/trips").send({ ...tripInput, days: 45 }).expect(400);
  });
});

