import express from "express";
import { whatsAppController } from "@/controllers/whatsapp-controller";

const router = express.Router();

// router.use(authHandler);

router.get("/", whatsAppController.getWhatsAppNotifications);

// router.post("/", whatsAppController.WhatsAppMessagesCreated);

export default router;
