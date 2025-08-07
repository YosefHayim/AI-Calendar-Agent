import { SUPABASE } from "@/config/root-config";
import { asyncHandler } from "@/utils/async-handler";

const getUser = asyncHandler(async () => {
  return await SUPABASE.auth.getUser();
});
