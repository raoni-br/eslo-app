import { Request, Response } from 'express';
import { Strategy, StrategyOptions, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

import { prismaClient } from '../../prisma';
import { esloConfig } from '../../secrets';
import authConfig from '../../config/auth.json';
import { ApiAccess, esloIAM } from '../../services/iam-client';
import { UserWithSubscription } from '../../models/user-profile.model';

interface JwtPayload {
    id: string;
    primaryEmail: string;
    displayName: string;
    firstName: string;
    familyName: string;
    profileComplete: boolean;
    roles: string[];
    apiAccess: ApiAccess;
}

interface LiveChatJWTPayload {
    name: string;
    email: string;
    // eslint-disable-next-line camelcase
    external_id: string;
}

const jwtStrategyOptions: StrategyOptions = {
    secretOrKey: esloConfig.jwtSecret,
    passReqToCallback: true,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

function getUserByJwtPayload(
    req: Request,
    jwtPayload: JwtPayload,
    // eslint-disable-next-line no-unused-vars
    done: (error: any, user?: UserWithSubscription) => void,
): void {
    prismaClient.user
        .findUnique({
            where: { id: jwtPayload.id },
            include: {
                subscriptions: {
                    include: {
                        subscriptionItems: {
                            include: { price: { include: { product: true } } },
                        },
                    },
                },
                studentEnrollments: true,
            },
        })
        .then((user: any) => {
            if (user) {
                req.user = user;
                done(null, user);
            } else {
                done('User not found');
            }
        })
        .catch(() => done('Error while authenticating user'));
}

const esloTokenValidation = new Strategy(jwtStrategyOptions, getUserByJwtPayload);

/**
 * Generates JWT for Zendesk live chat so logged in is automatically authenticated when chatting on app
 * @param res {Res} - Express Response
 * @param user {User} - Logged User
 * @returns {string} - Live Chat Token
 */
function generateLiveChatToken(res: Response, user: User): string | null {
    if (!esloConfig.liveChatEnabled) {
        return null;
    }

    const tokenPayload: LiveChatJWTPayload = {
        name: `${user.firstName} ${user.familyName}`,
        email: user.primaryEmail,
        external_id: user.id,
    };

    const liveChatToken = jwt.sign(tokenPayload, esloConfig.liveChatSecret || '', {
        algorithm: 'HS256',
        expiresIn: 60 * 5, // 5 minutes
    });

    res.setHeader('Access-Control-Expose-Headers', 'Token, Live-Chat-Token');
    res.setHeader('Live-Chat-Token', liveChatToken);

    return liveChatToken;
}

async function generateToken(res: Response, user: User, rememberMe: boolean): Promise<string> {
    const userSubscription = await prismaClient.user.findUnique({
        where: { id: user.id },
        include: {
            subscriptions: {
                include: {
                    subscriptionItems: {
                        include: { price: { include: { product: true } } },
                    },
                },
            },
            studentEnrollments: true,
        },
    });

    let roles: string[] = [];
    let apiAccess: ApiAccess = {
        queries: {},
        mutations: {},
    };

    if (userSubscription) {
        roles = await esloIAM.getRoles(userSubscription);
        apiAccess = await esloIAM.getApiAccess(userSubscription);
    }

    const jwtPayload: JwtPayload = {
        id: user.id,
        primaryEmail: user.primaryEmail,
        displayName: user.displayName,
        firstName: user.firstName,
        familyName: user.familyName,
        profileComplete: true, // TODO: refactor checkMyProfile function
        roles,
        apiAccess,
    };

    // generate live chat token if enabled
    generateLiveChatToken(res, user);

    // Generate JWT with different expiration time according to remember me option
    const expiresIn: string = rememberMe
        ? authConfig.tokenExpiresRememberMeInDays
        : authConfig.tokenExpiresWithoutRememberMeInHours;

    const token = jwt.sign(jwtPayload, esloConfig.jwtSecret, { expiresIn });

    res.setHeader('Access-Control-Expose-Headers', 'Token, Live-Chat-Token');
    res.setHeader('Token', token);

    return token;
}

export { esloTokenValidation, generateToken, generateLiveChatToken };
