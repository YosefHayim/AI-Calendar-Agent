import { MyContext } from "../init-bot";

export const setSessionUserTg = async (ctx: MyContext) => {
  if (ctx.session.messageCount === 0) ctx.session.messageCount = 1;
  else ctx.session.messageCount++;

  ctx.session.chatId = ctx.chat?.id ?? 0;
  ctx.session.username = ctx.from?.username;
  ctx.session.userId = ctx.from?.id ?? 0;
  ctx.session.codeLang = ctx.from?.language_code;
  console.log(ctx.session);
  return ctx.session;
};
