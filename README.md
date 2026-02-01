# IdeaForge

IdeaForge is an offline-first mobile app (iOS/Android) to capture ideas fast and turn them into structured, actionable plans.

Instead of dumping notes into a graveyard, you start an AI interview:
- it challenges your idea
- it asks the right questions
- it generates a complete report you can actually build

Ideas are stored locally (offline-first) and synced to the cloud (so losing your phone doesn’t delete everything).

## Core Features (MVP)
- **Ideas list**: browse, search, tag, sort (latest, status)
- **Idea detail**: AI-generated report (Markdown) + structured JSON + short summary
- **New idea flow**: chat-based AI interview (text-first)
- **Offline-first storage**: local DB (SQLite)
- **Cloud sync + Auth**: account login + backup + restore

## Product Flow
1. User taps **New Idea**
2. App starts **AI Interview** (chat)
3. AI asks structured questions and builds a live summary
4. User ends session
5. AI generates:
   - `report_md` (readable)
   - `report_json` (structured)
   - `summary` (short)
6. Idea is saved locally + synced to cloud

## AI Behavior (high level)
Two modes:

### 1) Interview Mode
Goal: clarify and challenge the raw idea.
Outputs:
- problem statement
- target user/persona
- constraints (time/budget/tech/legal)
- MVP scope
- open questions + risks

### 2) Report Mode
Goal: produce an actionable spec.
Report sections:
- Title + 1-liner pitch
- Problem / Users / Value proposition
- MVP features vs later features
- Technical architecture overview
- Data model (entities)
- Roadmap (phases)
- Risks / unknowns / next steps
- Security & privacy checklist

## Tech Stack (recommended)
### Mobile
- **React Native (Expo)**
- **TypeScript**
- **Navigation**: React Navigation
- **Local DB**: SQLite (expo-sqlite) + optional ORM (Drizzle)

### Backend / Cloud
Pick one:
- **Supabase** (Auth + Postgres + Storage) + Edge Functions
- **Firebase** (Auth + Firestore)
- **Custom API** (FastAPI / NestJS) + Postgres

### AI
- LLM provider: OpenAI API (switchable later)
- JSON schema output enforced for `report_json`

## Repo Structure
```

/apps
/mobile                      # Expo React Native app
/packages
/shared                      # Shared TS types, zod schemas, utils
/services
/cloud                        # Optional backend (edge functions / api)
/docs
architecture.md
data-model.md
prompts.md

```

## Data Model (MVP)
### Idea
- id: string (uuid)
- title: string
- createdAt: string (ISO)
- updatedAt: string (ISO)
- tags: string[]
- status: "draft" | "refined" | "archived"
- chat: ChatMessage[]
- summary: string
- reportMd: string
- reportJson: IdeaReport

### ChatMessage
- role: "user" | "assistant" | "system"
- content: string
- ts: string (ISO)

### IdeaReport (example)
- pitch: { title, oneLiner }
- problem: { statement, whyNow }
- audience: { personas: [...] }
- solution: { description, differentiators: [...] }
- features: { mvp: [...], later: [...] }
- architecture: { overview, components: [...] }
- dataModel: { entities: [...], relations: [...] }
- roadmap: { phases: [...] }
- risks: { items: [...] }
- checklist: { security: [...], privacy: [...], cost: [...] }

## Milestones
### v0.1 (Local-only)
- Expo app shell
- Ideas list + detail screens
- Local SQLite CRUD

### v0.2 (Chat interview)
- Chat UI
- AI interview prompts
- Save idea + report locally

### v0.3 (Cloud sync)
- Auth
- Sync idea list + detail
- Conflict strategy: last-write-wins (MVP)

### v0.4 (Export + templates)
- Export Markdown / PDF
- Templates (app idea, business idea, product idea)

## What you need to build a mobile app (practical)
- Node.js (LTS)
- Expo CLI
- Android Studio (Android emulator) OR physical Android device
- Xcode (for iOS builds, macOS required)
- A backend choice for auth/sync (Supabase recommended)

## Development Setup (suggested commands)
> Commands depend on your chosen stack. Example for Expo:

1) Create app:
- `npx create-expo-app apps/mobile -t`

2) Run:
- `cd apps/mobile`
- `npm run start`

## Security & Privacy Principles
- Minimal PII stored
- Clear delete learnings/data feature
- Never train on user data by default
- Secrets never stored in the client

## License
MIT


## Project struct (détaillé côté mobile)

### `apps/mobile/src` (suggestion)

```
apps/mobile/src
  /app                 # screens (IdeasList, IdeaDetail, NewIdea)
  /components          # reusable UI (IdeaCard, TagPill, ChatBubble)
  /db                  # sqlite init + repositories
  /ai                  # prompt builder + api client
  /sync                # cloud sync logic
  /state               # state management (zustand/redux)
  /types               # local types or re-export from packages/shared
  /utils               # helpers (date, uuid, markdown)
```

### Packages partagés

`/packages/shared`

* `types.ts` (Idea, Report schema)
* `schemas.ts` (zod schemas pour valider `report_json`)
* `constants.ts`

---

## Planification prompt (pour Cursor / “React” dev)

Copie-colle ça dans Cursor (ou ton “planning agent”). Ça force un plan propre, des tâches, et évite le spaghetti.

```text
You are a senior React Native + Expo engineer and product-minded architect.
Plan and scaffold the MVP for a mobile app called "IdeaForge":

Goal:
- Offline-first ideas app with an AI chat interview that generates a structured idea report.
- Save ideas locally (SQLite) and later add cloud sync.

Constraints:
- Expo + TypeScript
- Use React Navigation
- Use SQLite via expo-sqlite
- Output must be incremental, minimal, and production-oriented.
- Prefer zod schemas for validating AI JSON output.
- Do NOT implement cloud sync yet; stub interfaces for later.

Deliverables:
1) A clear milestone plan (v0.1, v0.2, v0.3) with task lists.
2) A repo folder structure proposal.
3) Data model definitions (TypeScript types + zod schemas).
4) Screen list + navigation map.
5) Local DB layer design: initialization, migrations strategy, repositories.
6) Minimal UI components list for MVP.
7) AI integration plan:
   - prompt strategy (interview mode + report mode)
   - strict JSON schema enforcement for report_json
   - error handling (invalid JSON, retries, fallbacks)
8) Provide the first implementation steps:
   - create expo app
   - install dependencies
   - create 2 screens (IdeasList, IdeaDetail) with local dummy data
   - then add SQLite CRUD

Output format:
- Use headings and bullet points.
- Provide concrete file paths for each module.
- Provide code snippets ONLY when necessary to illustrate a contract or schema.
- No big rewrites: propose changes in small increments.
