import { MyContext } from "../init-bot";
import { NextFunction } from "grammy";
import { SUPABASE } from "@/config/root-config";
import { User } from "@supabase/supabase-js";

export const authTgHandler = async (ctx: MyContext, next: NextFunction): Promise<User | undefined> => {
  const from = ctx?.from;
  const session = ctx?.session;
  if (from && session && session.messageCount === 0) {
    session.chatId = from.id;
    session.userId = from.id;
    session.username = from.username;
    session.codeLang = from.language_code;
    session.messageCount++;
  }
  if (!session || !from) {
    console.log(`Session or sender message is undefined: ${from}`);
    return;
  }

  const { data, error } = await SUPABASE.from("telegram_users").select("*").eq("chat_id", from.id);
  if (error) console.log(`Error of db query: ${JSON.stringify(error)}`);
  console.log(`User is auth: ${JSON.stringify(data)}`);
  await next();
};
