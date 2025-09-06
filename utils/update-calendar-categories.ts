import { SUPABASE } from '@/config/root-config';
import type { TablesInsert } from '@/database.types';
import type { UpdateCalendarCategoriesProps } from '@/types';
import { asyncHandler } from './async-handlers';

export const updateCalenderCategories = asyncHandler(
  async (
    payload: UpdateCalendarCategoriesProps[] | undefined,
    email: string,
    userId: string | null
  ): Promise<TablesInsert<'calendar_categories'>[] | false> => {
    if (payload?.length === 0 || !payload || !email) {
      return false;
    }

    const rows = payload
      .filter((p) => p?.calendarId)
      .map((p) => ({
        access_role: p.accessRole ?? null,
        calendar_id: p.calendarId,
        calendar_name: p.calendarName ?? null,
        email,
        user_id: userId,
        time_zone_of_calendar: p.timeZoneForCalendar ?? null,
      }));

    if (!rows.length) {
      return false;
    }
    const { data, error } = await SUPABASE.from('calendar_categories')
      .upsert({ ...rows, updated_at: new Date().toISOString() })
      .select();

    if (error) {
      throw error;
    }
    return data;
  }
);
