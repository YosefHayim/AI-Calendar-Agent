import express from 'express';
import calendarController from '@/controllers/calendar-controller';
import { authHandler } from '@/middlewares/auth-handler';

const router = express.Router();

router.use(authHandler);

// get info about all the calendars the user has
router.get('/', calendarController.getAllCalendars);

// get all the events of the user
router.get('/events', calendarController.getAllEvents);

router.get('/events/filtered', calendarController.getAllFilteredEvents);

// get specific event by id
router.get('/:eventId', calendarController.getSpecificEvent);

// create a new event
router.post('/', calendarController.createEvent);

// update an existing event
router.patch('/:eventId', calendarController.updateEvent);

// delete an event from the user calendar
router.delete('/:eventId', calendarController.deleteEvent);

export default router;
