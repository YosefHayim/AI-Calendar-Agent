import { RECOMMENDED_PROMPT_PREFIX } from '@openai/agents-core/extensions';

export const AGENT_INSTRUCTIONS = {
  validateUserAuth:
    'agent validates whether a user is registered in the system by querying the database. It requires a unique identifier, which is the email address. It returns a boolean and optional user metadata if found. It does not create, update, or delete any records.',

  validateEventFields:
    'agent converts free-text event details into a Google Calendar event object. It handles various input formats for summary, date, time, duration, timezone, location, and description. It applies default values if information is missing and ensures the output is a compact JSON matching the specified Google Calendar event object shape. It never asks questions and always proceeds with defaults if parsing fails.',

  insertEvent:
    'agent inserts a new event into the calendar using provided normalized fields. If any required field is missing, it computes it once using defaults and proceeds. It does not handoff back and returns only the tool’s JSON result.',

  getEventByIdOrName: `agent retrieves one or more events from the user's calendar by matching their title or keywords.`,

  updateEventByIdOrName:
    'agent updates an existing calendar event. It handles updates to summary, date, location, and duration. If a field is not specified, it keeps the original value.',

  deleteEventByIdOrName: 'agent deletes a calendar event based on the title or other identifying detail.',

  analysesCalendarTypeByEventInformation: `
Purpose
Infer the most appropriate calendar for an event using intent-level reasoning, not rote keyword matching. Return exactly one calendar from the user's actual list or "primary" as a safe fallback.

Input contract
- Use the exact email provided. Do not alter or infer.
- If email is missing/empty: {"status":"error","message":"email is required"} and stop.

Data access
- Fetch calendars via calendar_type_by_event_details(email).
- Keep returned names as-is for the final value.

Core reasoning
1) Build an intent vector from event evidence (title > description > location > attendees > organizer domain > links).
   Intents: meeting, work-focus, studies, self-study, health/care, travel/commute, errands, home-chores, social/family, person-time, side-project, break, holiday.
2) Signals (use as weak priors; do not hard-code exhaustive lists):
   - Meeting link or explicit meeting phrasing → boosts meeting.
   - Mobility verbs/contexts (drive, commute, shuttle, taxi, pickup/dropoff) → boosts travel/commute.
   - Care/medical/grooming terms (doctor, clinic, dentist, therapy, physio, haircut/barber/salon) → boosts health/care.
     If the event is clearly the journey (“drive to…”, commute buffers), travel/commute overrides health/care.
   - Named 1:1 with a person and a calendar “עם <name>” exists → boosts person-time strongly.
   - Formal course/lecture/exam → studies. Self-directed phrasing (“practice”, “tutorial”, “LeetCode”, “reading time”) → self-study.
   - Work verbs without meeting signals (“focus”, “deep work”, “deploy”, “refactor”) → work-focus.
   - Bank/post/renewals/visas/licenses → errands.
   - Cleaning/laundry/groceries/organizing → home-chores.
   - Family/friends/dinner/hangout → social/family.
   - Explicit lunch/break/rest → break.
   - Explicit holiday names only → holiday.
3) Language handling
   - Support he/en and common transliterations. Lowercase safely; strip diacritics. Do not rely on exact spelling.

Calendar mapping
- For each fetched calendar name, derive a calendar-intent prior by parsing its semantics.
- Score(calendar) = semantic_similarity(event_text, calendar_name + seed) + intent_alignment_weight.
- Return the highest scoring calendar.

Tie-breakers
- Travel/commute beats others when the event is clearly transit/buffer.
- Meeting beats work-focus when there’s a meeting link or external attendees.
- Health/care beats generic social/work when care is explicit.
- Person-time beats generic social if the named person matches.
- If still tied, choose the closest semantic match by name; if none, return "primary".

Output
{
  "status": "success",
  "calendar_type": "<exact matched name or 'primary'>",
  "confidence": 0.0–1.0,
  "reason": "short justification"
}

Errors
- Calendars API failure: {"status":"error","message":"failed to fetch calendars"}.
- Missing email: {"status":"error","message":"email is required"}.
`,

  normalizeEventAgent: `
You convert messy, free-text event details into a compact Google Calendar-style JSON object.

Rules:
- Default timezone: "Asia/Jerusalem" unless a different IANA TZ is explicitly given.
- If text contains a time range (e.g., "1am-3am", "1 am to 3 am"), use it as start/end.
- If only one time is present, set duration=60 minutes.
- If only a date + duration are present, do NOT create all-day. Use start=09:00 local, end=start+duration, and output with dateTime.
- If only a date is present (no duration, no time), create all-day: start.date=YYYY-MM-DD, end.date=YYYY-MM-DD+1.
- If end ≤ start, add 1 day to end.
- Summary default: "Untitled Event" (capitalize first letters).
- Output ONLY valid JSON matching Google Calendar schema; no extra keys, no commentary.
`,

  calendarRouterAgent: `${RECOMMENDED_PROMPT_PREFIX}
Plan before acting. Keep a concise scratchpad of confirmed facts (validated email, normalized event schema).

Execution rules:
- Always include "email" when calling any tool.
- Call tools only when their prerequisites are satisfied.
- After each tool returns, reassess:
  • If normalization succeeded, finalize and return the normalized JSON.

Dependencies:
1. validate_user must succeed before any other tool.
2. Once normalize_event succeeds, call calendar_type_by_event_details and update.
3. Once calendar_type_by_event_details succeeds, call normalize_event and returns the final output.
`,
};
