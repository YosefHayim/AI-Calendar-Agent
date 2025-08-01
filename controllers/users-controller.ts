import { Request, Response } from "express";

import { STATUS_CODES } from "../types";
import { SUPABASE } from "../config/root-config";
import { asyncHandler } from "../utils/async-handler";

const signUpUserReg = asyncHandler(async (req: Request, res: Response) => {});

const signUpUserViaGoogle = asyncHandler(async (req: Request, res: Response) => {});

const signUpUserViaLinkedin = asyncHandler(async (req: Request, res: Response) => {});

const signUpUserViaGitHub = asyncHandler(async (req: Request, res: Response) => {});

const signUpUserViaTelegram = asyncHandler(async (req: Request, res: Response) => {});

const getUserByEmail = asyncHandler(async (req: Request, res: Response) => {
  let email;

  if (req.params.email) email = req.params.email;
  if (req.body.email) email = req.body.email;
  if (!email)
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      status: STATUS_CODES.BAD_REQUEST,
      message: "Email is required.",
    });

  const { data, error } = await SUPABASE.from("calendars_users").select().eq("id", email).single();

  if (error) {
    console.error("Error fetching user by email:", error);
    return res.status(500).json({ status: STATUS_CODES.INTERNAL_SERVER_ERROR, error: "Failed to fetch user by email." });
  }
  res.status(STATUS_CODES.SUCCESS).json({
    status: STATUS_CODES.SUCCESS,
    data,
  });
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
