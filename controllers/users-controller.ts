import type { User } from '@supabase/supabase-js';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { CONFIG, OAUTH2CLIENT, SCOPES, SUPABASE } from '@/config/root-config';
import { type GoogleIdTokenPayloadProps, PROVIDERS, STATUS_RESPONSE, type TokensProps } from '@/types';
import { reqResAsyncHandler } from '@/utils/async-handlers';
import sendR from '@/utils/send-response';
import { thirdPartySignInOrSignUp } from '@/utils/third-party-signup-signin-supabase';

const generateAuthGoogleUrl = reqResAsyncHandler(async (req: Request, res: Response) => {
  const code = req.query.code as string | undefined;
  const postmanHeaders = req.headers['user-agent'] || '';

  const url = OAUTH2CLIENT.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
    include_granted_scopes: true,
    redirect_uri: CONFIG.redirect_url_dev,
  });

  // 1. No code yet: send user to consent screen
  if (!code) {
    // If from Postman, just send the URL back instead of redirecting
    if (postmanHeaders?.includes('Postman')) {
      return sendR(res, STATUS_RESPONSE.SUCCESS, url);
    }
    return res.redirect(url);
  }

  try {
    const { tokens } = await OAUTH2CLIENT.getToken(code);

    const { id_token, refresh_token, refresh_token_expires_in, expiry_date, access_token, token_type, scope } = tokens as TokensProps;

    const user = jwt.decode(id_token || '') as GoogleIdTokenPayloadProps;

    const { data, error } = await SUPABASE.from('user_calendar_tokens')
      .update({
        refresh_token_expires_in,
        refresh_token,
        expiry_date,
        access_token,
        token_type,
        id_token,
        scope,
        is_active:true,
        email: user.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('email', user.email)
      .select();

    if (error) {
      return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, 'Failed to store new tokens.', error);
    }

    sendR(res, STATUS_RESPONSE.SUCCESS, 'Tokens has been updated successfully.', {
      data,
    });
  } catch (error) {
    sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, 'Failed to process OAuth token exchange.', error);
  }
});

const signUpUserReg = reqResAsyncHandler(async (req: Request, res: Response) => {
  if (!(req.body.email && req.body.password)) {
    sendR(res, STATUS_RESPONSE.BAD_REQUEST, 'Email and password are required.');
  }
  const { data, error } = await SUPABASE.auth.signUp({
    email: req.body.email,
    password: req.body.password,
  });

  if (error) {
    sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, 'Failed to sign up user.', error);
    return;
  }
  if (data) {
    sendR(res, STATUS_RESPONSE.SUCCESS, 'User signed up successfully.', data);
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
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, 'User not authenticated.');
  }
  sendR(res, STATUS_RESPONSE.SUCCESS, 'User fetched successfully.', (req as Request & { user?: User }).user);
};

const deActivateUser = reqResAsyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await SUPABASE.from('user_calendar_tokens').select('email').eq('email', req.body.email);
  if (error) {
    return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, 'Failed to find user.', error);
  }
  if (data && data.length > 0) {
    const { error: updateError } = await SUPABASE.from('user_calendar_tokens').update({ is_active: false }).eq('email', req.body.email);
    if (updateError) {
      return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, 'Failed to deactivate user.', updateError);
    }
    return sendR(res, STATUS_RESPONSE.SUCCESS, 'User deactivated successfully.');
  }
});

const signInUserReg = reqResAsyncHandler(async (req: Request, res: Response) => {
  if (!(req.body.email && req.body.password)) {
    sendR(res, STATUS_RESPONSE.BAD_REQUEST, 'Email and password are required ');
  }

  const { data, error } = await SUPABASE.auth.signInWithPassword({
    email: req.body.email,
    password: req.body.password,
  });

  if (error) {
    sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, 'Failed to fetch user by email.', error);
  }

  sendR(res, STATUS_RESPONSE.SUCCESS, 'User signin successfully.', data);
});

const verifyEmailByOpt = reqResAsyncHandler(async (req: Request, res: Response) => {
  if (!(req.body.email && req.body.token)) {
    sendR(res, STATUS_RESPONSE.BAD_REQUEST, 'Email and token are required.');
  }

  const { data, error } = await SUPABASE.auth.verifyOtp({
    type: 'email',
    email: req.body.email,
    token: req.body.token,
  });

  if (error) {
    sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, 'Failed to verify email.', error);
  }

  sendR(res, STATUS_RESPONSE.SUCCESS, 'Email verified successfully.', data);
});

export const userController = {
  verifyEmailByOpt,
  signUpUserReg,
  signUpOrSignInWithGoogle,
  signUpUserViaGitHub,
  signInUserReg,
  getUserInformation,
  deActivateUser,
  generateAuthGoogleUrl,
};
