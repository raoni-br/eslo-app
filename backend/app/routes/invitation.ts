import express from 'express';

import { validateInvitation, declineInvitation } from '../middleware/invitation';

export const invitationRouter = express.Router();

invitationRouter.post('/confirm', validateInvitation);
invitationRouter.post('/decline', declineInvitation);
