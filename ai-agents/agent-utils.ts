import { type EventParametersProps, TIMEZONE } from "@/types";

export const formatEventData = (params: EventParametersProps): EventParametersProps => {
  if (!(params.start?.dateTime && params.end?.dateTime)) {
    throw new Error("Missing dates of start and end!");
  }
  if (params.start?.timeZone !== params.end?.timeZone && !(params.start?.timeZone! in TIMEZONE && params?.end?.timeZone! in TIMEZONE)) {
    throw new Error("Time zones must match!");
  }

  const startDate = new Date(params?.start?.dateTime!);
  const endDate = new Date(params?.end?.dateTime!);

  return {
    summary: params.summary,
    description: params.description,
    start: {
      dateTime: startDate.toISOString(),
      timeZone: params.start?.timeZone,
      date: startDate.toISOString().split("T")[0],
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: params.end?.timeZone || params.start?.timeZone,
      date: endDate.toISOString().split("T")[0],
    },
  };
};
