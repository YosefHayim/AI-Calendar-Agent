import express from "express";
import { telegramBotController } from "../controllers/telegram-bots-controller";

const router = express.Router();

router.get("/:id", telegramBotController.getTelegramBotById);

router.post("/", telegramBotController.createTelegramBot);

router.patch("/:id", telegramBotController.updateTelegramBotById);

router.delete("/:id", telegramBotController.deleteTelegramBotById);

export default router;
