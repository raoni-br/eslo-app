import { Request, Response } from 'express';
import createHttpError from 'http-errors';

import { prismaClient } from '../../prisma';
import { logger } from '../../utils/logger';

import { StudentDeclinedInvitationMessageTemplate } from '../../services/messaging/templates/student-declined-invitation';

import { esloMailService } from '../../services/messaging/email-engine';
import { esloConfig } from '../../secrets';
import { InvitationResponse } from '../../models/invitation.model';

async function validateInvitation(req: Request, res: Response) {
    // Define variables
    const { invitationToken } = req.body;

    try {
        // Verify if invitation exists
        const invitation = await prismaClient.invitation
            .findFirst({
                where: {
                    invitationToken,
                    status: 'PENDING',
                },
                include: {
                    enrollment: true,
                    invitee: true,
                },
            })
            .catch((err) => {
                logger.error({
                    message: 'Error while retrieving invitation with token from database',
                    errorDetails: err.message,
                    source: 'validateInvitation',
                    resourceType: 'Invitation',
                    action: 'activate',
                    context: { invitationToken },
                });
                throw createHttpError(500, 'Error while retrieving invitation with token given.');
            });

        if (!invitation) {
            logger.warn({
                message: 'Invitation not found with given token',
                source: 'validateInvitation',
                resourceType: 'Invitation',
                action: 'activate',
                context: { invitationToken },
            });
            throw createHttpError(400, 'Invitation not found with given token.');
        }

        if (!invitation.enrollment) {
            logger.warn({
                message: 'Invitation is not for an enrolment',
                source: 'validateInvitation',
                resourceType: 'Invitation',
                action: 'activate',
                context: { invitationToken },
            });

            throw createHttpError(400, 'Invitation is not for an enrolment.');
        }

        const invitationResponse: InvitationResponse = {
            email: invitation.invitee.primaryEmail,
            firstName: invitation.invitee.firstName,
            surname: invitation.invitee.familyName,
            invitationToken,
        };

        res.status(200).send(invitationResponse);
    } catch (err: any) {
        res.status(err.status || 500).send('Failed to update invitation.');
    }
}

async function declineInvitation(req: Request, res: Response) {
    const { invitationToken } = req.body;

    try {
        // Verify if invitation exists
        const invitation = await prismaClient.invitation
            .findFirst({
                where: {
                    invitationToken,
                    status: 'PENDING',
                },
                include: {
                    enrollment: true,
                    inviter: true,
                    invitee: true,
                },
            })
            .catch((err) => {
                logger.error({
                    message: 'Error while retrieving invitation with token from database',
                    errorDetails: err.message,
                    resourceType: 'Invitation',
                    action: 'cancel',
                    source: 'declineInvitation',
                    context: { invitationToken },
                });
                throw createHttpError(500, 'Error while retrieving invitation with token given.');
            });

        if (!invitation) {
            throw createHttpError(400, 'Invitation not found.');
        }

        if (!invitation.enrollment) {
            throw createHttpError(400, 'Invitation is not for an enrolment.');
        }

        await prismaClient.invitation.update({
            include: { enrollment: true },
            data: {
                status: 'DECLINED',
                enrollment: {
                    update: {
                        status: 'CANCELLED',
                    },
                },
            },
            where: { id: invitation.id },
        });

        await prismaClient.event.updateMany({
            where: { sourceType: 'ENROLLMENT', enrollmentId: invitation.enrollment.id },
            data: {
                status: 'CANCELLED',
                deletedAt: new Date(),
            },
        });

        // send email to teacher and platform admin informing that the invitation has been declined
        const studentDeclinedInvitationTemplate = new StudentDeclinedInvitationMessageTemplate({
            studentName: invitation.invitee.firstName || '',
            tutorName: invitation.inviter.firstName,
            invitationPageUrl: `${esloConfig.frontendUrl}/classes`,
        });

        // send email teacher
        esloMailService.sendEmailWithTemplate(invitation.inviter.primaryEmail, studentDeclinedInvitationTemplate);

        // send email admin
        esloMailService.sendEmailWithTemplate(esloConfig.platformAdminEmail, studentDeclinedInvitationTemplate);

        return res.status(200).send('Deleted invitation');
    } catch (err: any) {
        return res.status(err.status || 500).send('Failed to update invitation.');
    }
}

export { validateInvitation, declineInvitation };
