import { STATUS_RESPONSE } from "../types";
import { SUPABASE } from "../config/root-config";
import { TOKEN_FIELDS } from "./storage";
import { User } from "@supabase/supabase-js";
import errorTemplate from "./error-template";

export async function getUserCalendarTokens(user: User, matchBy: "email") {
  const { data, error } = await SUPABASE.from("calendars_users")
    .select(TOKEN_FIELDS)
    .eq(matchBy, matchBy === "email" ? user.email! : user.id);

  if (error) {
    return errorTemplate(`Error occurred durning getUserCalendarTokens fn: ${error}`, STATUS_RESPONSE.INTERNAL_SERVER_ERROR);
  }

  return data?.[0] || null;
}
