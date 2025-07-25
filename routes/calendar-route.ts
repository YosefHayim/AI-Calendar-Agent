import calendarController from "../controllers/calendar-controller";
import express from "express";

const router = express.Router();

// get info about all the calendars of user
router.get("/", calendarController.getAllCalendars);

// get all the next events of the user
router.get("/events", calendarController.getAllEvents);

// get specific event by id
router.get("/:eventId", calendarController.getSpecificEvent);

// create a new event
router.post("/", calendarController.createEvent);

// update an existing event
router.patch("/:eventId", calendarController.updateEvent);

// delete an event from the user calendar
router.delete("/:eventId", calendarController.deleteEvent);

export default router;
