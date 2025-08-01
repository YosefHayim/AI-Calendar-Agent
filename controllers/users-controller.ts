import { CONFIG, SUPABASE } from "../config/root-config";
import { Request, Response } from "express";

import { STATUS_RESPONSE } from "../types";
import { asyncHandler } from "../utils/async-handler";
import sendR from "../utils/sendR";

const signUpUserReg = asyncHandler(async (req: Request, res: Response) => {});

const signUpUserViaGoogle = asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await SUPABASE.auth.signUp({
    email: req.body.email,
    password: req.body.password,
    options: {
      emailRedirectTo: CONFIG.node_env === "production" ? CONFIG.redirect_url_prod : CONFIG.redirect_url_dev,
    },
  });

  if (error) {
    console.error("Error signing up user:", error);
    sendR(res)(STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to sign up user.", error);
  }

  if (data) {
    sendR(res)(STATUS_RESPONSE.SUCCESS, "User signed up successfully.", data);
  }
});

const signUpUserViaLinkedin = asyncHandler(async (req: Request, res: Response) => {});

const signUpUserViaGitHub = asyncHandler(async (req: Request, res: Response) => {});

const signUpUserViaTelegram = asyncHandler(async (req: Request, res: Response) => {});

const getUserByEmail = asyncHandler(async (req: Request, res: Response) => {
  let email;

  if (req.params.email) email = req.params.email;
  if (req.body.email) email = req.body.email;
  if (!email)
    return res.status(STATUS_RESPONSE.BAD_REQUEST).json({
      status: STATUS_RESPONSE.BAD_REQUEST,
      message: "Email is required.",
    });

  const { data, error } = await SUPABASE.from("calendars_users").select().eq("id", email).single();

  if (error) {
    console.error("Error fetching user by email:", error);
    sendR(res)(STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to fetch user by email.", error);
  }
  sendR(res)(STATUS_RESPONSE.SUCCESS, "User fetched successfully.", data);
});

const deActivateUser = asyncHandler(async (req: Request, res: Response) => {});

const updateUserById = asyncHandler(async (req: Request, res: Response) => {});

export const userController = {
  signUpUserReg,
  signUpUserViaGoogle,
  signUpUserViaLinkedin,
  signUpUserViaGitHub,
  getUserByEmail,
  deActivateUser,
  updateUserById,
  signUpUserViaTelegram,
};
