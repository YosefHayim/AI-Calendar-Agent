import { calendar_v3 } from 'googleapis';

const isEventReqValid = (event: calendar_v3.Params$Resource$Events$Insert): boolean => {
  return !Object.values(event).some((ev) => ev === null || ev === undefined);
};

export default isEventReqValid;
