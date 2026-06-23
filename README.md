# Wayfare — AI Travel Planner

Wayfare is a multi-user travel planning application that turns a destination, trip length, budget, and interests into a complete day-by-day itinerary. Travelers can edit individual activities, regenerate a specific day, review an estimated trip budget, and compare hotel suggestions without rebuilding the rest of their journey.

The product is deliberately designed as a calm, editorial travel experience rather than a generic AI form.

## Live application

- Application: [wayfare-ai-travel-planner.vercel.app](https://wayfare-ai-travel-planner.vercel.app)
- API health check: [wayfare-api.netlify.app/health](https://wayfare-api.netlify.app/health)
- Repository: [github.com/Priyanshu61900/wayfare-ai-travel-planner](https://github.com/Priyanshu61900/wayfare-ai-travel-planner)

## Chosen stack

| Layer | Technology | Why |
| --- | --- | --- |
| Web | Next.js 16, React 19, TypeScript | Strong routing, rendering, accessibility, and deployment ergonomics |
| Styling | Tailwind CSS 4 plus a custom design system | Utility tooling with deliberate reusable visual tokens |
| API | Node.js, Express 5, TypeScript | Explicit HTTP boundaries and middleware-driven security |
| Database | MongoDB with Mongoose | Natural fit for nested, evolving itinerary documents |
| AI | OpenAI Responses API with strict JSON Schema | Structured output that can be validated before persistence |
| Validation | Zod | Shared runtime guarantees at all input and AI boundaries |
| Auth | bcrypt + signed JWT in an HTTP-only cookie | Passwords never stored directly; browser JavaScript cannot read the session |
| Tests | Vitest + Supertest | Fast API integration tests, including ownership isolation |

## What is included

- Secure registration, login, logout, and session restoration
- Personalized dashboard for every user
- Strict trip ownership checks on every read and mutation
- Guided trip form for destination, 1–14 days, budget style, interests, and notes
- AI-generated structured day-by-day itinerary
- Complete budget estimate for flights, accommodation, food, activities, local transport, and contingency
- Three hotel suggestions across budget-friendly, mid-range, and luxury tiers
- Remove an activity
- Add a custom activity
- Regenerate one day from a natural-language request
- Rename and delete a trip
- Responsive, accessible states for loading, empty data, errors, and destructive actions
- OpenAI generation with automatic local fallback when no key is configured or a generation fails
- Docker and Render deployment configuration

## Creative feature: Trip Pulse

Trip Pulse is an energy forecast for an itinerary. It scores the overall balance of a trip and explains how each day is likely to feel: relaxed, balanced, or packed.

This solves a problem most itinerary generators miss. A plan can be geographically valid and still be exhausting. Trip Pulse considers the number and duration of activities, highlights overloaded days, and recommends where to leave breathing room. It makes the AI output easier to judge instead of asking the user to trust it blindly.

## Architecture

```text
Browser
  │
  ├── Next.js UI
  │     └── /api/* same-origin rewrite
  │
  └── Express API
        ├── Helmet, JSON limits, CORS, rate limits
        ├── Auth middleware → signed HTTP-only session
        ├── Zod validation
        ├── Trip service → OpenAI or local planner
        └── Store interface
              ├── MongoStore (production)
              └── MemoryStore (zero-config development/tests)
```

The repository pattern keeps the HTTP and domain logic independent of MongoDB. The app starts immediately in development with an in-memory store, while production uses MongoDB whenever `MONGODB_URI` is set.

## Authentication and authorization

1. Passwords are hashed with bcrypt using 12 rounds.
2. A successful login sets a signed JWT in an HTTP-only, `SameSite=Lax` cookie.
3. Protected routes verify the signature and expiry before continuing.
4. Every trip query includes both `tripId` and the authenticated `userId`.
5. A user requesting another user’s trip receives `404`, not `403`, so the API does not reveal that the resource exists.
6. Login and AI generation endpoints are rate-limited.
7. Helmet, a 64 KB JSON body limit, centralized errors, and strict schemas reduce common attack surface.

For deployment, route the API through the Next.js `/api` rewrite as configured. This preserves same-origin cookies and avoids exposing tokens to browser storage.

## AI agent design

The AI service has a small, typed interface:

- `generateTrip(input)`
- `regenerateDay(input, day, preference)`

When `OPENAI_API_KEY` is available, the Express server uses the OpenAI Responses API with a strict JSON Schema. The response is parsed and validated with Zod before any data is stored. If the provider is unavailable, returns malformed data, or produces the wrong number of days, the service falls back to the deterministic local planner.

This decision keeps the application demonstrable during an interview even if credentials, quota, or network access are unavailable. Generated prices are clearly labeled as estimates rather than live quotes.

## Local setup

Requirements:

- Node.js 22 or newer
- npm 10 or newer
- MongoDB only if persistent local data is desired

```bash
git clone <your-repository-url>
cd wayfare
npm install
copy .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The default development setup requires no database or AI key:

- The API uses an in-memory store.
- The itinerary service uses the local planner.
- Restarting the API clears in-memory data.

For the full production path, set:

```env
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=...
JWT_SECRET=a-long-random-secret-with-at-least-32-characters
OPENAI_MODEL=gpt-5-mini
```

Never commit `.env` files or expose `OPENAI_API_KEY` through a `NEXT_PUBLIC_*` variable.

## Available commands

```bash
npm run dev        # Start web and API in watch mode
npm run build      # Production builds for both applications
npm run test       # API integration suite
npm run lint       # ESLint for both applications
npm run typecheck  # Strict TypeScript check
npm run start      # Start both production builds
```

## API overview

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create account and session |
| `POST` | `/api/auth/login` | Start session |
| `POST` | `/api/auth/logout` | Clear session |
| `GET` | `/api/auth/me` | Restore current user |
| `GET` | `/api/trips` | List the authenticated user’s trips |
| `POST` | `/api/trips` | Generate and save a trip |
| `GET` | `/api/trips/:id` | Read one owned trip |
| `PATCH` | `/api/trips/:id` | Rename an owned trip |
| `DELETE` | `/api/trips/:id` | Delete an owned trip |
| `POST` | `/api/trips/:id/activities` | Add an activity |
| `DELETE` | `/api/trips/:id/days/:day/activities/:activityId` | Remove an activity |
| `POST` | `/api/trips/:id/days/:day/regenerate` | Regenerate one day |

## Testing

The integration suite verifies:

- registration and authenticated session restoration
- complete itinerary, budget, hotel, and Trip Pulse generation
- activity removal and single-day regeneration
- rejection of malformed input
- rejection of unauthenticated access
- strict cross-user read, update, and delete isolation

Run it with:

```bash
npm test
```

## Deployment

### Option A: Docker Compose

```bash
docker compose up --build
```

This starts MongoDB, the Express API, and the Next.js web application.

### Option B: Vercel + Netlify Functions

1. Push the repository to GitHub.
2. Create a MongoDB Atlas database.
3. Import the repository into Netlify using the root `netlify.toml`.
4. Set `MONGODB_URI`, `JWT_SECRET`, `WEB_ORIGIN`, and optionally `OPENAI_API_KEY` in Netlify.
5. Import the repository into Vercel with `apps/web` as the root directory.
6. Set `API_URL` in Vercel to the Netlify site origin.
7. Set `WEB_ORIGIN` in Netlify to the final Vercel URL.
8. Verify `/health`, registration, generation, edits, and logout in production.

Environment variables are read only on the server. The OpenAI key, database URI, and JWT secret are never included in the browser bundle.

## High-level design decisions and trade-offs

- **HTTP-only cookie instead of local storage:** reduces token theft through injected browser JavaScript. Same-origin rewriting keeps deployment straightforward.
- **404 for foreign resources:** prevents ownership enumeration.
- **Repository abstraction:** adds a small amount of code but makes tests fast and local setup frictionless.
- **Structured AI output:** slightly more verbose than free-form prompting, but prevents malformed itineraries from reaching the UI.
- **Graceful local fallback:** maximizes reliability and interview demo quality; the UI labels whether the trip used OpenAI or smart local mode.
- **Estimates instead of invented live pricing:** protects user trust. A production expansion would connect hotel, flight, maps, and currency providers.
- **Trip Pulse instead of another recommendation list:** demonstrates product judgment by helping users evaluate plan quality.

## Known limitations

- Flight, map, opening-hours, weather, and booking providers are not connected.
- The local development store is intentionally ephemeral when no MongoDB URI is present.
- Currency defaults to USD.



