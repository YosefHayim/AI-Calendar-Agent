import { SUPABASE } from "@/config/root-config";
import { TOKEN_FIELDS } from "./storage";
import { User } from "@supabase/supabase-js";
import { asyncHandler } from "./async-handlers";

export const getUserCalendarTokens = asyncHandler(async (matchBy: "email", user?: User) => {
  const { data, error } = await SUPABASE.from("calendars_of_users").select(TOKEN_FIELDS).eq(matchBy, user?.email!);
  console.log(`getUserCalendarTokens: ${data}`);
  return data?.[0] || null;
});
