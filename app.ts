import { CONFIG } from './config/env-config';
import authRouter from './routes/auth-route';
import calendarRoute from './routes/calendar-route';
import cors from 'cors';
import errorHandler from './middlewares/error-handler';
import express from 'express';
import morgan from 'morgan';

const app = express();
const PORT = CONFIG.port;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('Welcome to backend of AI Calendar Agent');
});

app.use('/api/auth', authRouter);
app.use('/api/calendar', calendarRoute);

app.use(errorHandler);

app.listen(PORT);
