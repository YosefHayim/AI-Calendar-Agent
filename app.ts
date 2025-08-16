import { ROUTES, STATUS_RESPONSE } from './types';

import { CONFIG } from '@/config/root-config';
import calendarRoute from '@/routes/calendar-route';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import errorHandler from '@/middlewares/error-handler';
import express from 'express';
import morgan from 'morgan';
import path from 'node:path';
import { startTelegramBot } from '@/telegram-bot/init-bot';
import usersRouter from '@/routes/users';

const app = express();
const PORT = CONFIG.port;
const _BASE_URL = CONFIG.base_url;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/', (_req, res) => {
  res.status(STATUS_RESPONSE.SUCCESS).send('Server is running.');
});

app.use(ROUTES.USERS, usersRouter);
app.use(ROUTES.CALENDAR, calendarRoute);

app.use(errorHandler);

app.listen(PORT, (error?: Error) => {
  if (error) {
    throw error
  }
  console.log('Server is running...')
});

startTelegramBot();
