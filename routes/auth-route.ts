import express from 'express';
import generateAuthUrl from '../controllers/auth-controller';

const router = express.Router();

router.get('/v1/callback', generateAuthUrl);

export default router;
