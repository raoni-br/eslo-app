import express, { Request, Response } from 'express';

import { esloPassport } from '../middleware/auth/passport';
import { authRouter } from './auth';
import { invitationRouter } from './invitation';
import { paymentRouter } from './payment';

export const router = express.Router();

// Authenticated GraphQL endpoint
const authenticateOptions = { session: false, passReqToCallback: true };
router.use('/graphql', esloPassport.authenticate('jwt', authenticateOptions));

/* GET index */
router.get('/', (req: Request, res: Response) => {
    res.send('Hello eslo.');
});

router.use('/auth', authRouter);
router.use('/invitation', invitationRouter);
router.use('/payment', paymentRouter);
