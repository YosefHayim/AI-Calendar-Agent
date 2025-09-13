import type { Request, Response } from "express";
import { CONFIG } from "@/config/root-config";
import { STATUS_RESPONSE } from "@/types";

const getWhatsAppNotifications = (req: Request, res: Response) => {
  const { "hub.mode": mode, "hub.challenge": challenge, "hub.verify_token": token } = req.query;

  if (mode === "subscribe" && token === CONFIG.devWhatsAppAccessToken) {
    console.log("WEBHOOK VERIFIED");
    res.status(STATUS_RESPONSE.SUCCESS).send(challenge);
  } else {
    res.status(STATUS_RESPONSE.FORBIDDEN).end();
  }
};

const WhatsAppMessagesCreated = (req: Request, res: Response) => {
  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));
  res.status(STATUS_RESPONSE.SUCCESS).end();
};

export const whatsAppController = {
  getWhatsAppNotifications,
  WhatsAppMessagesCreated,
};
