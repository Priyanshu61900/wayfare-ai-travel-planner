# Wayfare walkthrough — 3–4 minutes

## 0:00–0:30 — Product framing

Open the landing page.

“Wayfare is an AI travel planner designed around a simple idea: a valid itinerary is not always an enjoyable one. It creates editable day-by-day plans, practical budget estimates, hotel suggestions, and an energy forecast called Trip Pulse.”

Briefly scroll through the landing page and show the responsive editorial design.

## 0:30–1:05 — Authentication and isolation

Register a new account and land on the personalized dashboard.

“Authentication uses bcrypt password hashing and a signed JWT in an HTTP-only cookie. Every trip query includes the authenticated user ID. Requests for another user’s trip return 404 so the API does not leak whether that resource exists.”

## 1:05–1:45 — Generate a journey

Select “Plan a new trip.”

- Destination: Kyoto
- Days: 5
- Interests: Food, Culture, Nature, Photography
- Budget: Comfortable
- Note: “A slow first morning and one special dinner.”

Generate the itinerary.

“The API asks the model for strict structured output and validates it before storage. If the provider or key is unavailable, a deterministic local planner keeps the app fully demonstrable.”

## 1:45–2:35 — AI and editing

Open two itinerary days.

- Remove an activity.
- Add a custom activity.
- Choose “Rethink this day.”
- Enter: “More outdoor activities and a slower afternoon.”

“Regeneration is scoped to one day, so the user remains in control and the rest of the plan is untouched.”

## 2:35–3:15 — Creative feature and budget

Open Trip Pulse.

“Trip Pulse is my custom feature. It helps users spot days that are technically possible but likely exhausting. It scores each day’s energy and explains whether the pace is relaxed, balanced, or packed.”

Open Budget and Stays.

“The budget includes flights, accommodation, food, activities, transport, and contingency. Hotel suggestions cover three tiers. They are explicitly presented as planning estimates rather than fake live quotes.”

## 3:15–3:45 — Architecture and trade-offs

Show the README architecture diagram or code briefly.

“The project is a TypeScript monorepo with Next.js, Express, MongoDB, Zod, and OpenAI. A repository abstraction gives production Mongo persistence and zero-config in-memory development. The important trade-off is reliability over pretending every external dependency is always available.”

End on the trip dashboard.

