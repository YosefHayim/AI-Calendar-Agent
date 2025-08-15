import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { CONFIG } from '@/config/root-config';
import errorHandler from '@/middlewares/error-handler';
import calendarRoute from '@/routes/calendar-route';
import conversationStatsRouter from '@/routes/conversation-stats';
import usersRouter from '@/routes/users';
import { startTelegramBot } from '@/telegram-bot/init-bot';
import { ROUTES, STATUS_RESPONSE } from './types';

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
app.use(ROUTES.CONVERSATION_STATS, conversationStatsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  if (CONFIG.node_env === 'production') {
  } else {
  }
});

startTelegramBot();
