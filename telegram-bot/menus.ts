import { Menu } from "@grammyjs/menu";
import type { MyContext } from "./init-bot";

export const mainMenu = new Menu<MyContext>("calendar-operations")
	.text("Create Event", async (ctx) => {
		await ctx.conversation.enter("insertEventToCalendar");
		await ctx.menu.close();
	})
	.row()
	.text("Search Event", async (ctx) => {
		await ctx.conversation.enter("searchForEventByName");
		await ctx.menu.close();
	})
	.row()
	.text("Delete Event", async (ctx) => {
		await ctx.conversation.enter("deleteEventByName");
		await ctx.menu.close();
	})
	.row()
	.text("Update Event", async (ctx) => {
		await ctx.conversation.enter("updateEventByName");
		await ctx.menu.close();
	})
	.row()
	.text("List Calendars", async (ctx) => {
		await ctx.conversation.enter("getCalendarList");
		await ctx.menu.close();
	})
	.row()
	.text("Chat with AI", async (ctx) => {
		await ctx.conversation.enter("chatWithAgent");
		await ctx.menu.close();
	});
