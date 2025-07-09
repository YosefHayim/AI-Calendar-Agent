import { CONFIG } from "./config/root-config";
import CREDENTIALS from "./CREDENTIALS.json";
import authRouter from "./routes/auth-route";
import calendarRoute from "./routes/calendar-route";
import cors from "cors";
import errorHandler from "./middlewares/error-handler";
import express from "express";
import { initAiTelegramBot } from "./ai-telegram-bot";
import morgan from "morgan";

const app = express();
const PORT = CONFIG.port;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  if (CREDENTIALS.expiry_date <= Date.now() || CREDENTIALS.expiry_date === 0) {
    res.redirect(`${CONFIG.redirect_url}`);
  } else {
    res.status(200).send("Server is running and everything is established correctly.");
  }
});

app.use("/api/auth", authRouter);
app.use("/api/calendar", calendarRoute);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

await initAiTelegramBot();
