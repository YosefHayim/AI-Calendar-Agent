import { STATUS_RESPONSE } from "../types";
import { SUPABASE } from "../config/root-config";
import { TOKEN_FIELDS } from "./storage";
import { User } from "@supabase/supabase-js";
import { asyncHandler } from "./async-handler";
import errorTemplate from "./error-template";

export const getUserCalendarTokens = asyncHandler(async (user: User, matchBy: "email") => {
  const { data, error } = await SUPABASE.from("calendars_of_users").select(TOKEN_FIELDS).eq(matchBy, user.email!);

  console.log(`Fetch data of user: ${JSON.stringify(data)}`);
  if (error) {
    return errorTemplate(`Error occurred durning getUserCalendarTokens fn: ${error}`, STATUS_RESPONSE.INTERNAL_SERVER_ERROR);
  }

  return data?.[0] || null;
});
