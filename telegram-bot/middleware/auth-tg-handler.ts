import { MyContext } from "../init-bot";
import { NextFunction } from "grammy";
import { SUPABASE } from "@/config/root-config";
import { User } from "@supabase/supabase-js";
import isEmail from "validator/lib/isEmail";

interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  email: string;
  username: string;
  language_code: string;
}

export const authTgHandler = async (ctx: MyContext, next: NextFunction): Promise<TelegramUser | void | undefined> => {
  const from = ctx?.from;
  const session = ctx?.session;

  if (!from || !session) return await next();

  if (session.messageCount === 0) {
    session.chatId = from.id;
    session.userId = from.id;
    session.username = from.username;
    session.codeLang = from.language_code;
  }
  session.messageCount++;

  // Check if email already exists in DB
  const { data, error } = await SUPABASE.from("telegram_users").select("email,first_name").eq("chat_id", from.id).single();

  if (data?.email && session.messageCount === 1) {
    await ctx.reply(`Hello there ${data.first_name}`);
    session.email = data.email;
    console.log("auth session set: ", session);
    await next();
    return;
  }

  // Check if email is already collected in this session
  if (!session.email) {
    if (!isEmail(ctx.message?.text || "")) {
      await ctx.reply("First time? Please provide your email to authorize:");
      return;
    }

    const emailMessage = ctx.message!.text!;
    session.email = emailMessage;

    await SUPABASE.from("telegram_users").insert({
      chat_id: from.id,
      username: from.username,
      first_name: from.first_name,
      language_code: from.language_code,
      user_id: from.id,
      email: emailMessage,
    });

    await ctx.reply(`Email has been saved successfully!`);
  }
  console.log("auth session: ", session);
  await next();
};
