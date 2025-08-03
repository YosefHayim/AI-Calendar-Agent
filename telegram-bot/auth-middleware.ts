import { Context, NextFunction } from "grammy";

import { MyContext } from "./init-bot";
import { SUPABASE } from "@/config/root-config";

export const authTgHandler = async (ctx: MyContext, next: NextFunction) => {
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
