import { AGENTS } from "../ai-agents/agents";
import { Context } from "grammy";
import { Conversation } from "@grammyjs/conversations";
import { activateAgent } from "../utils/activate-agent";
import { getTokensOfUserAndAI } from "../utils/get-tokens-user-ai-";
import { run } from "@openai/agents";
import { userAndAiMessageProps } from "../types";

export const insertEventToCalendar = async (conversation: Conversation, ctx: Context) => {
  let eventName;
  let eventDate;
  let eventTime;

  await ctx.reply("Please provide the name of the event (minimum 3 letters): ");
  while (true) {
    eventName = (await conversation.waitFor("message:text")).message?.text;

    if (!eventName || eventName.length < 3) {
      await ctx.reply("Event name must be at least 3 letters. Please try again.");
      continue;
    }
    break;
  }

  await ctx.reply(`Next, Please provide the date of the event.`);
  while (true) {
    eventDate = (await conversation.waitFor("message:text")).message?.text;

    if (!eventDate || eventDate.length < 7) {
      await ctx.reply("Event date must be at least 7 letters. Please try again.");
      continue;
    }
    break;
  }

  await ctx.reply(`Great, so the last thing I need from you is what is the duration of that event? you can either provide a time range.`);
  while (true) {
    eventTime = (await conversation.waitFor("message:text")).message?.text;
    if (!eventTime || eventTime.length < 3) {
      await ctx.reply("Event time must be at least 3 letters. Please try again");
      continue;
    }
    break;
  }

  await ctx.reply(`Great, I will now proceed to insert the event, please wait...`);
  const result = await activateAgent(
    AGENTS.insertEvent,
    `Insert this event into my calendar:\nEvent name:${eventName}\nDate of the event: ${eventDate}\nTime range of the event: ${eventTime}`
  );
  await ctx.reply(result.finalOutput!);
};

export const searchForEventByName = async (conversation: Conversation, ctx: Context) => {
  await ctx.reply("Please tell me the name of the event you are looking for: ");
  const { message: messageOne } = await conversation.waitFor("message:text");
  await ctx.reply(`Please wait while I search for all the events with the name: ${messageOne}`);
  const r = await run(AGENTS.searchForEventByName, `Search for all the events with the name: ${messageOne.text}`);
  await ctx.reply(r.finalOutput!);
};

export const updateEventByName = async (conversation: Conversation, ctx: Context) => {
  await ctx.reply("Please tell me the name of the event you want to update: ");
  const { message: messageOne } = await conversation.waitFor("message:text");

  await ctx.reply(`Please provide the new details for the event: ${messageOne.text}`);
  const { message: messageTwo } = await conversation.waitFor("message:text");
  await ctx.reply(`Please wait while I update the event: ${messageOne.text}`);
  const r = await run(AGENTS.updateEventByName, `Update the event with the name: ${messageOne.text}) with the new details: ${messageTwo.text}`);
  await ctx.reply(r.finalOutput!);
};

export const getCalendarList = async (conversation: Conversation, ctx: Context) => {
  await ctx.reply("Please wait while I fetch your calendar list...");
  const r = await run(AGENTS.calendarList, "Get me all the calendars list I have");
  await ctx.reply(r.finalOutput!);
};

export const deleteEventByName = async (conversation: Conversation, ctx: Context) => {
  await ctx.reply("Please tell me the name of the event you want to delete: ");
  const { message: messageOne } = await conversation.waitFor("message:text");
  await ctx.reply(`Please wait while I delete the event: ${messageOne.text}`);
  const r = await run(AGENTS.deleteEventByName, `Delete the event with the name: ${messageOne.text}`);
  await ctx.reply(r.finalOutput!);
};

const userAndAiMessages: userAndAiMessageProps[] = [];

export const chatWithAgent = async (conversation: Conversation, ctx: Context) => {
  const message = (await conversation.waitFor("message:text")).message?.text;

  userAndAiMessages.push({ role: "user", content: message });

  const r = await run(
    AGENTS.chatWithAgent,
    `Chat with the agent about: ${userAndAiMessages.length > 0 ? userAndAiMessages.map((m: any) => m.content).join(" ") : message}`
  );
  userAndAiMessages.push({ role: "assistant", content: r.finalOutput });
  console.log(userAndAiMessages);
  await ctx.reply(r.finalOutput!);
};
