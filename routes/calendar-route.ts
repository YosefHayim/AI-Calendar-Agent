import express from 'express';
import calendarController from '../controllers/calendar-controller';

const router = express.Router();

// get info about all the calendars of user
router.get('/', calendarController.getAllCalendars);

router.post('/new-event', calendarController.createEvent);

export default router;
