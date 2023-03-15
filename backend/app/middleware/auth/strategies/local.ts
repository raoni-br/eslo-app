import { Strategy, IStrategyOptions, IVerifyOptions } from 'passport-local';
import * as argon2 from 'argon2';

import { Prisma } from '@prisma/client';
import createHttpError from 'http-errors';

import { prismaClient } from '../../../prisma';

// Prisma only exposes models with raw attributes.
// When using relations (i.e. include: {})a custom type must be defined
type UserWithAuth = Prisma.UserGetPayload<{
    include: { userAuthenticationList: true };
}> | null;

const strategyOptions: IStrategyOptions = {
    usernameField: 'email',
    passwordField: 'password',
};

function verifyUser(
    email: string,
    password: string,
    // eslint-disable-next-line no-unused-vars
    done: (error: any, user?: any, options?: IVerifyOptions) => void,
): void {
    prismaClient.user
        .findFirst({
            where: {
                userAuthenticationList: {
                    some: {
                        strategyCode: 'LOCAL',
                        strategyId: email,
                    },
                },
            },
            include: {
                userAuthenticationList: {
                    where: {
                        strategyCode: 'LOCAL',
                        strategyId: email,
                    },
                },
            },
        })
        .then(async (userRow: UserWithAuth) => {
            if (!userRow) {
                throw createHttpError(400, 'Invalid email/password');
            }

            // validate password
            const localStrategy = userRow.userAuthenticationList.find(
                (auth) => auth.strategyCode === 'LOCAL' && auth.strategyId === email,
            );

            if (!localStrategy) {
                throw createHttpError(400, 'Invalid email/password');
            }

            const passwordMatched = await argon2.verify(localStrategy.hashedPassword!, password);
            if (!passwordMatched) {
                throw createHttpError(400, 'Invalid email/password');
            }

            return done(null, userRow, { message: 'Login succeeded' });
        })
        .catch((error: any) => done(error, null, { message: error.message }));
}

export const esloLocalStrategy = new Strategy(strategyOptions, verifyUser);
