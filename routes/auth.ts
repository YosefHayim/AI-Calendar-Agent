import express from "express";
import generateAuthUrl from "../controllers/authController";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).send("auth route exist");
});

router.get("/v1/callback", generateAuthUrl);

export default router;
