import { Context } from "grammy";
import { Conversation } from "@grammyjs/conversations";
import { calendarRouterAgent } from "../ai-agents/main-agent";
import { run } from "@openai/agents";

export const provideEventDetails = async (conversation: Conversation, ctx: Context) => {
  await ctx.reply("Please provide the name of the event: ");
  const { message: messageOne } = await conversation.waitFor("message:text");
  await ctx.reply(`Next, Please provide the date of the event.`);
  const { message: messageTwo } = await conversation.waitFor("message:text");
  await ctx.reply(`Great, so the last thing I need from you is what is the duration of that event? you can either provide a time range.`);
  const { message: messageThree } = await conversation.waitFor("message:text");
  await ctx.reply(`Great, I will now proceed to insert the event, please wait...`);
  const r = await run(
    calendarRouterAgent,
    `Insert this event into my calendar:\nEvent name:${messageOne.text}\nDate of the event: ${messageTwo.text}\nTime range of the event: ${messageThree.text}`
  );
  await ctx.reply(r.finalOutput!);
};

export const searchForEventByName = async (conversation: Conversation, ctx: Context) => {
  await ctx.reply("Please tell me the name of the event you are looking for: ");
  const { message: messageOne } = await conversation.waitFor("message:text");
  await ctx.reply(`Please wait while I search for all the events with the name: ${messageOne}`);
  const r = await run(calendarRouterAgent, `Search for all the events with the name: ${messageOne.text}`);
  await ctx.reply(r.finalOutput!);
};

export const updateEventByName = async (conversation: Conversation, ctx: Context) => {
  await ctx.reply("Please tell me the name of the event you want to update: ");
  const { message: messageOne } = await conversation.waitFor("message:text");
  await ctx.reply(`Please provide the new details for the event: ${messageOne.text}`);
  const { message: messageTwo } = await conversation.waitFor("message:text");
  await ctx.reply(`Please wait while I update the event: ${messageOne.text}`);
  const r = await run(calendarRouterAgent, `Update the event with the name: ${messageOne.text}) with the new details: ${messageTwo.text}`);
  await ctx.reply(r.finalOutput!);
};

export const getCalendarList = async (conversation: Conversation, ctx: Context) => {
  await ctx.reply("Please wait while I fetch your calendar list...");
  const r = await run(calendarRouterAgent, "Get me all the calendars list I have");
  await ctx.reply(r.finalOutput!);
};
