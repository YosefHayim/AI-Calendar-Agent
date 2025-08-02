import { SUPABASE } from "../config/root-config";
import { TOKEN_FIELDS } from "./storage";
import { User } from "@supabase/supabase-js";
import { asyncHandler } from "./async-handler";

export const getUserCalendarTokens = asyncHandler(async (user: User, matchBy: "email") => {
  const { data, error } = await SUPABASE.from("calendars_of_users").select(TOKEN_FIELDS).eq(matchBy, user.email!);

  return data?.[0] || null;
});
