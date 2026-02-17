# AI Implementation Plan (Saved for Later)

This file captures the proposed AI features and rollout plan for FitBank.

## Goal

Add practical AI features for:
- Meal suggestions
- Daily/weekly analysis
- Actionable improvement coaching

Use a hybrid model:
- Keep core calorie calculations deterministic in code.
- Use AI for recommendations and explanations.

## Phase 1 (MVP)

### Backend

1. Add AI service layer:
- `apps/api/src/services/ai.service.ts`

2. Add AI routes:
- `apps/api/src/routes/ai.routes.ts`

3. Register AI routes in:
- `apps/api/src/index.ts`

4. Add environment variables:
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (optional, default in code)

Update:
- `apps/api/src/config.ts`
- `.env.example`

### API Endpoints

1. `POST /api/ai/meal-suggestions`
- Input: `mealType`, `targetCalories`, `preferences`, `date`
- Output: 3-5 meal options, estimated calories, short reason for each

2. `GET /api/ai/daily-analysis?date=YYYY-MM-DD`
- Output: day summary, what went well, what to improve, one next action

3. `GET /api/ai/weekly-improvements`
- Output: weekly trend summary and top 3 improvement actions

### Validation and Safety

1. Add strict schemas:
- `packages/shared/src/schemas/ai.ts`

2. Validate every AI response before returning to web.

3. If AI output is invalid:
- Return deterministic fallback suggestions.

4. Add disclaimer text in UI:
- Informational only, not medical advice.

## Phase 2 (Better Recommendations)

1. Improve data model for nutrition quality:
- Add macros (protein/carbs/fat) to food items
- Add optional tags (`high_protein`, `quick_meal`, etc.)

2. Improve prompting context:
- Use profile + recent meals + remaining daily calories
- Use user preferences and restrictions

3. Add caching:
- Cache same-user/same-date AI responses to reduce cost and latency

## Phase 3 (Product Quality)

1. UX integration:
- Add "AI Coach" card to dashboard
- Add "Suggest Meal" action in meal log dialog
- One-click apply suggestion to meal entry

2. Observability:
- Track AI latency, validation failures, and fallback rate
- Log prompt/response metadata (without sensitive raw data)

3. Cost control:
- Per-user daily request cap
- Optional debounce/throttle on repeated calls

## Suggested Implementation Order

1. AI service + route skeleton
2. Meal suggestions endpoint
3. Dashboard daily analysis
4. Weekly improvements endpoint
5. UI wiring and polish
6. Caching + observability

## Notes

- Keep all health calculations in `packages/shared/src/calculations.ts` and existing services.
- AI should explain and personalize, not replace deterministic logic.
- Build this incrementally behind simple feature flags if needed.
