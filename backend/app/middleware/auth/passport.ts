import passport from 'passport';

import { User } from '@prisma/client';
import { esloLocalStrategy } from './strategies/local';
import { esloTokenValidation } from './token';

import { prismaClient } from '../../prisma';

passport.use(esloLocalStrategy);
passport.use(esloTokenValidation);

// serialise / deserealise user

passport.serializeUser((user, done) => {
    const dbUser = user as User;
    done(null, dbUser.id);
});

passport.deserializeUser((userId: string, done) => {
    prismaClient.user
        .findUnique({ where: { id: userId } })
        .then((user: User | null) => {
            if (!user) {
                return done({ message: 'User not found' }, false);
            }

            return done(null, user);
        })
        .catch((error) => done(error, null));
});

export const esloPassport = passport;
