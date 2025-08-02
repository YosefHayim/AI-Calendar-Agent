import { CONFIG, OAUTH2CLIENT, SCOPES, SCOPES_STRING, SUPABASE } from "../config/root-config";
import { PROVIDERS, STATUS_RESPONSE } from "../types";
import { Request, Response } from "express";
import { asyncHandler, reqResAsyncHandler } from "../utils/async-handler";

import jwt from "jsonwebtoken";
import sendR from "../utils/send-response";
import { thirdPartySignInOrSignUp } from "../utils/third-party-signup-signin-supabase";

const generateAuthGoogleUrl = reqResAsyncHandler(async (req, res) => {
  const code = req.query.code as string | undefined;
  const postmanHeaders = req.headers["user-agent"];

  const url = OAUTH2CLIENT.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    include_granted_scopes: true,
    redirect_uri: CONFIG.redirect_url_dev,
  });

  // 1. No code yet: send user to consent screen
  if (!code) {
    // If from Postman, just send the URL back instead of redirecting
    if (postmanHeaders?.includes("Postman")) return sendR(res, STATUS_RESPONSE.SUCCESS, url);
    return res.redirect(url);
  }

  try {
    const { tokens } = await OAUTH2CLIENT.getToken(code);
    OAUTH2CLIENT.setCredentials(tokens);

    // 3. Token still valid
    OAUTH2CLIENT.setCredentials(tokens);

    const user = jwt.decode(tokens.id_token!);

    const { data, error } = await SUPABASE.from("calendars_of_users")
      .insert({
        ...tokens,
        scope: SCOPES.join(" "),
        //@ts-ignore
        email: user.email,
      })
      //@ts-ignore
      .eq("email", user.email)
      .select();

    if (error) {
      console.error("Error inserting tokens into database:", error);
      return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to store new tokens.", error);
    }

    sendR(res, STATUS_RESPONSE.SUCCESS, "Existing token is still valid.", { data });
  } catch (error) {
    console.error("generateAuthUrl error:", error);
    sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to process OAuth token exchange.", error);
  }
});

const signUpUserReg = asyncHandler(async (req: Request, res: Response) => {
  if (!req.body.email || !req.body.password) sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Email and password are required.");
  console.log(req.body);
  const { data, error } = await SUPABASE.auth.signUp({
    email: req.body.email,
    password: req.body.password,
  });

  if (error) {
    console.error("Error signing up regularly user:", error);
    sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to sign up user.", error);
  }
  if (data) {
    sendR(res, STATUS_RESPONSE.SUCCESS, "User signed up successfully.", data);
  }
});

const signUpOrSignInWithGoogle = asyncHandler(async (req: Request, res: Response) => {
  await thirdPartySignInOrSignUp(req, res, PROVIDERS.GOOGLE);
});

const signUpUserViaLinkedin = asyncHandler(async (req: Request, res: Response) => {});

const signUpUserViaGitHub = asyncHandler(async (req: Request, res: Response) => {
  await thirdPartySignInOrSignUp(req, res, PROVIDERS.GITHUB);
});

const getUserInformation = asyncHandler(async (req, res) => {
  if (!req.user) return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated.");
  sendR(res, STATUS_RESPONSE.SUCCESS, "User fetched successfully.", req.user);
});

const deActivateUser = asyncHandler(async (req: Request, res: Response) => {});

const signInUserReg = asyncHandler(async (req: Request, res: Response) => {
  if (!req.body.email || !req.body.password) sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Email and password are required ");

  const { data, error } = await SUPABASE.auth.signInWithPassword({
    email: req.body.email,
    password: req.body.password,
  });

  if (error) {
    console.error("Error signing up regularly user by email:", error);
    sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to fetch user by email.", error);
  }

  sendR(res, STATUS_RESPONSE.SUCCESS, "User signin successfully.", data);
});

const updateUserById = asyncHandler(async (req: Request, res: Response) => {});

export const userController = {
  signUpUserReg,
  signUpOrSignInWithGoogle,
  signUpUserViaLinkedin,
  signUpUserViaGitHub,
  signInUserReg,
  getUserInformation,
  deActivateUser,
  updateUserById,
  generateAuthGoogleUrl,
};
