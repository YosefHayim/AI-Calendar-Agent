import { authHandler } from "../middlewares/auth";
import calendarController from "../controllers/calendar-controller";
import express from "express";

const router = express.Router();

// get info about all the calendars of user
router.get("/", authHandler, calendarController.getAllCalendars);

// get all the next events of the user
router.get("/events", authHandler, calendarController.getAllEvents);

// get specific event by id
router.get("/:eventId", authHandler, calendarController.getSpecificEvent);

// create a new event
router.post("/", authHandler, calendarController.createEvent);

// update an existing event
router.patch("/:eventId", authHandler, calendarController.updateEvent);

// delete an event from the user calendar
router.delete("/:eventId", authHandler, calendarController.deleteEvent);

export default router;
