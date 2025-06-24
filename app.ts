import { CONFIG } from "./config/env-config";
import express from "express";
import authRouter from "./routes/auth-route";
import calendarRoute from "./routes/calendar-route";
import errorHandler from "./middlewares/error-handler";

const app = express();
const PORT = CONFIG.port;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome to backend of AI Calendar Agent");
});

app.use("/api/auth", authRouter);
app.use("/api/calendar", calendarRoute);

app.use(errorHandler);

app.listen(PORT);
