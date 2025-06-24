import express from "express";
import generateAuthUrl from "../controllers/authController";

const router = express.Router();

router.get("/auth/v1/callback", generateAuthUrl);
