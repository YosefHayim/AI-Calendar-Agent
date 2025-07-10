export const insertEventFn = async (eventData: calendar_v3.Schema$Event): GaxiosPromise<calendar_v3.Schema$Event> => {
  console.log("Event input recieved from agent: ", eventData);
  try {
    const r = await calendar.events.insert({
      ...requestConfigBase,
      requestBody: eventData,
    });
    if (r) console.log("Event has been successfully inserted: ", r.data);
    return r;
  } catch (error) {
    console.error("Error inserting event:", error);
    throw new Error("Failed to insert event");
  }
};
