import { Menu } from "@grammyjs/menu";
import { MyContext } from "./init-bot";

export const mainMenu = new Menu<MyContext>("calendar-operations")
  .text("Create Event", async (ctx) => {
    await ctx.conversation.enter("insertEventToCalendar");
    await ctx.menu.close();
  })
  .row()
  .text("Search Event", async (ctx) => {
    await ctx.conversation.enter("searchForEventByName");
  })
  .row()
  .text("Delete Event", async (ctx) => {
    await ctx.conversation.enter("deleteEventByName");
  })
  .row()
  .text("Update Event", async (ctx) => {
    await ctx.conversation.enter("updateEventByName");
  })
  .row()
  .text("List Calendars", async (ctx) => {
    await ctx.conversation.enter("getCalendarList");
  })
  .row()
  .text("Chat with AI", async (ctx) => {
    await ctx.conversation.enter("chatWithAgent");
  });
