import { Bot, session, type SessionFlavor, type Context } from "grammy";
import { conversations, createConversation, type ConversationFlavor } from "@grammyjs/conversations";
import { chatWithAgent, getCalendarList, insertEventToCalendar, searchForEventByName } from "./conversations";
import { CONFIG, SUPABASE } from "@/config/root-config";
import { asyncHandler } from "@/utils/async-handler";
import { Menu, MenuFlavor } from "@grammyjs/menu";
import { mainMenu } from "./menus";
import { SessionData } from "@/types";

type BaseContext = Context & MenuFlavor;
type MyContext = ConversationFlavor<BaseContext>;
type MySessionFlavor = SessionFlavor<SessionData>;

const bot = new Bot<MyContext & MySessionFlavor>(CONFIG.telegram_access_token!);

bot.catch((err: any) => {
  console.error("Error in bot:", err);
});

const commandMap: Record<string, string> = {
  "get-calendars-list": "getCalendarList",
  "add-event": "insertEventToCalendar",
  "search-event": "searchForEventByName",
  "chat-with-agent": "chatWithAgent",
};

function initial(): SessionData {
  return {
    chatId: 0,
    userId: 0,
    username: "",
    codeLang: "",
    messageCount: 0,
    email: "",
  };
}

bot.use(session({ initial }));
bot.use(conversations());
bot.use(mainMenu);

bot.command("start", async (ctx) => {
  await ctx.reply("Calendar Operations Bot", { reply_markup: mainMenu });
});

bot.use(createConversation(insertEventToCalendar));
bot.use(createConversation(getCalendarList));
bot.use(createConversation(searchForEventByName));
bot.use(createConversation(chatWithAgent));

bot.on("message:text", async (ctx) => {
  let data;
  let error;
  const message = ctx.message?.text.toLowerCase();
  const username = ctx.from?.username;
  const userId = ctx.from?.id;
  const chatId = ctx.chat?.id;
  const codeLang = ctx.from?.language_code;

  ctx.session.messageCount++;

  if (!message) return;

  if (message.includes("@")) ctx.session.email = message;

  if (ctx.session.messageCount === 1) {
    (await ctx.reply("Hello, welcome to AI Calendar Personal Assistant Agent.")).text;
    const email = (
      await ctx.reply("In order to proceed, please provide us your email address to check if you are already logged in *PLEASE RESPOND EMAIL ONLY*")
    ).text;

    if (email.includes("@")) {
      const { data, error } = await SUPABASE.from("calendars_of_users").select("*").eq("email", email);
      if (data?.length === 0) {
        const sixDigits = await ctx.reply("You are not signed up to our system, please enter the six digits sent to your email. *REPLY 6 digits only*");

        if (sixDigits.text.length === 6) {
          const { data, error } = await SUPABASE.auth.signInWithOtp({
            email: email,
          });

          if (data) {
            console.log(`User successfully signin with Otp: ${data}`);
          }
          console.error(`Error durning user signin with otp: ${error}`);
        }
      } else {
        ctx.session.email = email;
        const sixDigits = await ctx.reply(
          "You are already signed up to our system, please provide us the 6 digits we have sent to your email. *REPLY 6 digits only*"
        );

        if (sixDigits.text.length === 6) {
          const { data, error } = await SUPABASE.auth.signInWithOtp({
            email: email,
          });

          if (data) {
            console.log(`User successfully signin with Otp: ${data}`);
          }
          console.error(`Error durning user signin with otp: ${error}`);
        }
      }
    }

    ctx.session.chatId = chatId;
    ctx.session.username = username;
    ctx.session.userId = userId;
    ctx.session.chatId = chatId;
    ctx.session.codeLang = codeLang;
  }

  if (message === "return") {
    console.log("Exited conversation successfully");
    await ctx.reply("You have exited the conversation.");
    if (ctx.conversation) await ctx.conversation.exit(commandMap[message]);
    return;
  }

  if (commandMap[message]) {
    return ctx.conversation.enter(commandMap[message]);
  }
});

export const startTelegramBot = asyncHandler(async () => {
  console.log("Telegram bot is running...");

  await bot.start({ allowed_updates: ["message"] });
});
