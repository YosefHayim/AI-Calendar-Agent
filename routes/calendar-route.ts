import calendarController from '../controllers/calendar-controller';
import express from 'express';

const router = express.Router();

// get info about all the calendars of user
router.get('/', calendarController.getAllCalendars);

// get all the next events of the user
router.get('/events', calendarController.getAllEvents);

// create a new event
router.post('/', calendarController.createEvent);

router.patch('/', calendarController.updateEvent);

// delete an event from the user calendar
router.delete('/', calendarController.deleteEvent);

export default router;
