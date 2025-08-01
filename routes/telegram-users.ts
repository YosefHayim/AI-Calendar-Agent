import express from "express";
import { telegramUserController } from "../controllers/telegram-users-controller";

const router = express.Router();

router.get("/", telegramUserController.getTelegramUserById);

router.post("/", telegramUserController.createTelegramUser);

router.patch("/:id", telegramUserController.updateTelegramUserByIdd);

router.delete("/:id", telegramUserController.deleteTelegramUserById);

export default router;
