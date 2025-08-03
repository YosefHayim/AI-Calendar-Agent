import { Menu } from "@grammyjs/menu";

export const mainMenu = new Menu("calendar-operations")
  .text("Would you like to add an event to your calendar?", (ctx) => ctx.reply("Initiating Agent"))
  .row()
  .text("Search for an event by name", (ctx) => ctx.reply("Initiating Agent"))
  .row()
  .text("Delete an event", (ctx) => ctx.reply("Initiating Agent"))
  .row()
  .text("Get your calendar list", (ctx) => ctx.reply("Initiating Agent"));
