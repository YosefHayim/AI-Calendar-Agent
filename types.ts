import { calendar_v3 } from 'googleapis';

export enum Action {
  GET = 'get',
  INSERT = 'insert',
  UPDATE = 'update',
}

export type eventDataRequest = calendar_v3.Schema$Event;
