import { SUPABASE } from "@/config/root-config";
import type { Tables, TablesInsert } from "@/database.types";
import type { UpdateCalendarCategoriesProps } from "@/types";
import { asyncHandler } from "./async-handlers";

export const updateCalenderCategories = asyncHandler(
  async (payload: UpdateCalendarCategoriesProps[] | undefined, email: string, userId: string | null): Promise<Tables<"calendar_categories">[] | false> => {
    if (!(payload?.length && email)) {
      return false;
    }

    const rows = payload
      .filter((p) => p?.calendarId)
      .map((p) => ({
        access_role: p.accessRole ?? null,
        calendar_id: p.calendarId as string,
        calendar_name: p.calendarName ?? null,
        email,
        time_zone_of_calendar: p.timeZoneForCalendar ?? null,
        default_reminders: p.defaultReminders ?? null,
        updated_at: new Date().toISOString(),
        user_id: userId,
      })) as TablesInsert<"calendar_categories">[];

    if (!rows.length) {
      return false;
    }

    const { data, error } = await SUPABASE.from("calendar_categories").upsert(rows).select();

    if (error) {
      throw error;
    }
    return data ?? false;
  }
);
