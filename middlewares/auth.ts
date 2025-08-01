import { SUPABASE } from "../config/root-config";
import { asyncHandler } from "../utils/async-handler";

export const authHandler = asyncHandler(async () => {
  const {
    data: { user },
  } = await SUPABASE.auth.getUser();

  if (!user) {
    console.error("User not authenticated");
  }
});
