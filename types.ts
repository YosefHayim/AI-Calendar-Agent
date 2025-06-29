import { calendar_v3 } from 'googleapis';

export enum Action {
  GET = 'get',
  INSERT = 'insert',
  UPDATE = 'update',
  DELETE = 'Delete',
}

export type SchemaEventProps = calendar_v3.Schema$Event;
