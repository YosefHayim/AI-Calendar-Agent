import { SUPABASE } from '@/config/root-config';
import type { UpdateCalendarCategoriesProps } from '@/types';
import { asyncHandler } from './async-handlers';

export const updateCalenderCategories = asyncHandler(async (payload: UpdateCalendarCategoriesProps[] | undefined, email: string, userId: string | null) => {
  if (payload?.length === 0 || !payload || !email) {
    return false;
  }

  const nowIso = new Date().toISOString();

  const rows = payload
    .filter((p) => p?.calendarId)
    .map((p) => ({
      access_role: p.accessRole ?? null,
      calendar_id: p.calendarId,
      calendar_name: p.calendarName ?? null,
      email,
      time_zone_of_calendar: p.timeZoneForCalendar ?? null,
      updated_at: nowIso,
    }));

  if (!rows.length) {
    return false;
  }

  const { error } = await SUPABASE.from('calendar_categories').upsert({ ...rows, user_id: userId });

  if (error) {
    throw error;
  }

  return true;
});
