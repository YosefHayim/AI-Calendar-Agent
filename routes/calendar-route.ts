import calendarController from '../controllers/calendar-controller';
import express from 'express';

const router = express.Router();

// get info about all the calendars of user
router.get('/', calendarController.getAllCalendars);

router.get('/new-event', calendarController.createEvent);

export default router;
