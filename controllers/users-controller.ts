import { CONFIG, OAUTH2CLIENT, SCOPES, SUPABASE } from "@/config/root-config";
import { PROVIDERS, STATUS_RESPONSE } from "@/types";
import type { Request, Response } from "express";

import type { User } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import { reqResAsyncHandler } from "@/utils/async-handlers";
import sendR from "@/utils/send-response";
import { thirdPartySignInOrSignUp } from "@/utils/third-party-signup-signin-supabase";

const generateAuthGoogleUrl = reqResAsyncHandler(async (req, res) => {
  const code = req.query.code as string | undefined;
  const postmanHeaders = req.headers["user-agent"] || "";

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
    if (postmanHeaders?.includes("Postman")) {
      return sendR(res, STATUS_RESPONSE.SUCCESS, url);
    }
    return res.redirect(url);
  }

  try {
    const { tokens } = await OAUTH2CLIENT.getToken(code);

    // 3. Token still valid
    OAUTH2CLIENT.setCredentials(tokens);

    const { id_token, refresh_token, expiry_date, access_token, token_type } = tokens;

    const user = jwt.decode(tokens.id_token || "") as jwt.JwtPayload;

    const { data, error } = await SUPABASE.from("calendars_of_users")
      .insert({
        refresh_token,
        user_id: "",
        expiry_date,
        access_token,
        token_type,
        id_token,
        scope: SCOPES.join(" "),
        email: user.email,
      })
      .eq("email", user.email)
      .select();

    if (error) {
      return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to store new tokens.", error);
    }

    sendR(res, STATUS_RESPONSE.SUCCESS, "Existing token is still valid.", {
      data,
    });
  } catch (error) {
    sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to process OAuth token exchange.", error);
  }
});

const signUpUserReg = reqResAsyncHandler(async (req: Request, res: Response) => {
  if (!(req.body.email && req.body.password)) {
    sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Email and password are required.");
  }
  const { data, error } = await SUPABASE.auth.signUp({
    email: req.body.email,
    password: req.body.password,
  });

  if (error) {
    sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to sign up user.", error);
    return;
  }
  if (data) {
    sendR(res, STATUS_RESPONSE.SUCCESS, "User signed up successfully.", data);
    return;
  }
});

const signUpOrSignInWithGoogle = reqResAsyncHandler(async (req: Request, res: Response) => {
  await thirdPartySignInOrSignUp(req, res, PROVIDERS.GOOGLE);
});

const signUpUserViaGitHub = reqResAsyncHandler(async (req: Request, res: Response) => {
  await thirdPartySignInOrSignUp(req, res, PROVIDERS.GITHUB);
});

const getUserInformation = (req: Request, res: Response) => {
  if (!(req as Request & { user?: User }).user) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated.");
  }
  sendR(res, STATUS_RESPONSE.SUCCESS, "User fetched successfully.", (req as Request & { user?: User }).user);
};

// const deActivateUser = reqResAsyncHandler(
//   async (_req: Request, _res: Response) => {}
// );

const signInUserReg = reqResAsyncHandler(async (req: Request, res: Response) => {
  if (!(req.body.email && req.body.password)) {
    sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Email and password are required ");
  }

  const { data, error } = await SUPABASE.auth.signInWithPassword({
    email: req.body.email,
    password: req.body.password,
  });

  if (error) {
    sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to fetch user by email.", error);
  }

  sendR(res, STATUS_RESPONSE.SUCCESS, "User signin successfully.", data);
});

const verifyEmailByOpt = reqResAsyncHandler(async (req: Request, res: Response) => {
  if (!(req.body.email && req.body.token)) {
    sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Email and token are required.");
  }

  const { data, error } = await SUPABASE.auth.verifyOtp({
    type: "email",
    email: req.body.email,
    token: req.body.token,
  });

  if (error) {
    sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to verify email.", error);
  }

  sendR(res, STATUS_RESPONSE.SUCCESS, "Email verified successfully.", data);
});

export const userController = {
  verifyEmailByOpt,
  signUpUserReg,
  signUpOrSignInWithGoogle,
  // signUpUserViaLinkedin,
  signUpUserViaGitHub,
  signInUserReg,
  getUserInformation,
  // deActivateUser,
  // updateUserById,
  generateAuthGoogleUrl,
};
