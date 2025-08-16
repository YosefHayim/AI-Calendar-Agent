import type { GlobalContext } from '../init-bot';
import type { MiddlewareFn } from 'grammy';
import { SUPABASE } from '@/config/root-config';
import isEmail from 'validator/lib/isEmail';

export const authTgHandler: MiddlewareFn<GlobalContext> = async (ctx, next) => {
  const from = ctx.from;
  const session = ctx.session;

  if (!(from && session)) {
    return next();
  }

  // Initialize session once
  if (!session.chatId) {
    session.chatId = from.id;
    session.userId = from.id;
    session.username = from.username ?? '';
    session.codeLang = from.language_code ?? 'en';
    session.messageCount = 0;
  }

  // Try to load from DB
  const { data } = await SUPABASE.from('telegram_users').select('email,first_name').eq('chat_id', session.chatId).single();

  if (data?.email) {
    if (!session.email) {
      session.email = data.email;
    }
    if (session.messageCount === 0) {
      await ctx.reply(`Hello there ${data.first_name}`);
    }
    session.messageCount++;
    return next(); // single exit with next()
  }

  // Ask for email if missing
  if (!session.email) {
    const text = ctx.message?.text?.trim();
    if (!(text && isEmail(text))) {
      await ctx.reply('First time? Please provide your email to authorize:');
      return; // do NOT call next()
    }

    // Save email
    session.email = text;
    await SUPABASE.from('telegram_users').upsert({
      chat_id: from.id,
      user_id: from.id,
      username: from.username,
      first_name: from.first_name,
      language_code: from.language_code,
      email: text,
    });
    await ctx.reply('Email has been saved successfully!');
    session.messageCount++;
    return next();
  }

  return next();
};
