import { calendar_v3 } from 'googleapis';

export enum Action {
  GET = 'get',
  INSERT = 'insert',
  UPDATE = 'update',
}

export type eventDataRequest = calendar_v3.Schema$Event;

interface OAuth2ClientProps {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expiry_date: number;
}

export interface ConfigBase {
  auth: OAuth2ClientProps;
  calendarId: string;
  supportsAttachments: boolean;
  sendNotifications: boolean;
}
