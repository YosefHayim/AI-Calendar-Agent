import path from "node:path";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import { CONFIG } from "@/config/root-config";
import errorHandler from "@/middlewares/error-handler";
import calendarRoute from "@/routes/calendar-route";
import usersRoute from "@/routes/users";
import whatsAppRoute from "@/routes/whatsapp-route";
import { startTelegramBot } from "./telegram-bot/init-bot";
import { ROUTES, STATUS_RESPONSE } from "./types";

const app = express();
const PORT = CONFIG.port;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/static", express.static(path.join(__dirname, "public")));

app.get("/", (_req, res) => {
  res.status(STATUS_RESPONSE.SUCCESS).send("Server is running.");
});

app.use(ROUTES.USERS, usersRoute);
app.use(ROUTES.CALENDAR, calendarRoute);
app.use(ROUTES.WHATSAPP, whatsAppRoute);

app.use(errorHandler);

app.listen(8080, (error?: Error) => {
  if (error) {
    throw error;
  }
  console.log(`Server is running on port: ${PORT}`);
});

startTelegramBot();
