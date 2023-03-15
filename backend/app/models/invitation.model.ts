import { Invitation, SourceType, User } from '@prisma/client';
import { uid } from 'rand-token';
import { UserInputError } from 'apollo-server-express';

import { logger } from '../utils/logger';
import { InviteStudentMessageTemplate } from '../services/messaging/templates/invite-student';
import { InviteExistingStudentMessageTemplate } from '../services/messaging/templates/invite-existing-student';
import { MessageTemplate } from '../services/messaging/templates';
import { esloMailService } from '../services/messaging/email-engine';
import { esloConfig } from '../secrets';

import { EsloModel, ISourceInput } from './eslo.model';
import { UserWithSubscription } from './user-profile.model';
import { IStudentInput } from './enrollment.model';

export interface InvitationResponse extends IStudentInput {
    invitationToken: string;
}

interface InvitationInput {
    sourceType: SourceType;
    sourceId: string;
    inviter: UserWithSubscription;
    invitee: User;
    existingStudent: boolean;
}

export class InvitationModel extends EsloModel {
    constructor(loggedUser: UserWithSubscription) {
        super(loggedUser, 'invitation');
    }

    public async findById(id: string): Promise<Invitation | null> {
        const invitation = await this.prismaClient.invitation.findUnique({
            where: { id },
        });

        if (!invitation) {
            return null;
        }

        await this.validateIAM({
            action: 'read',
            resourceType: 'Invitation',
            resource: invitation,
        });

        return invitation;
    }

    public async findByInvitationToken(invitationToken: string): Promise<Invitation | null> {
        const invitation = await this.prismaClient.invitation.findUnique({
            where: { invitationToken },
        });

        if (!invitation) {
            return null;
        }

        await this.validateIAM({
            action: 'read',
            resourceType: 'Invitation',
            resource: invitation,
        });

        return invitation;
    }

    public async findBySource(source: ISourceInput): Promise<Invitation | null> {
        const invitation = await this.prismaClient.invitation.findFirst({
            where: {
                sourceType: source.sourceType,
                OR: [{ enrollmentId: source.sourceId }, { studyGroupId: source.sourceId }],
            },
        });

        if (!invitation) {
            return null;
        }

        await this.validateIAM({
            action: 'read',
            resourceType: 'Invitation',
            resource: invitation,
        });

        return invitation;
    }

    public async findInvitationsReceivedByUser(userId: string): Promise<Invitation[]> {
        const iamPermission = await this.validateIAM({
            action: 'list',
            resourceType: 'Enrollment',
        });

        return this.prismaClient.invitation.findMany({
            where: { AND: { ...iamPermission.filter }, inviteeId: userId },
        });
    }

    public async createInvitation(invitation: InvitationInput): Promise<Invitation> {
        const newInvitation = {
            sourceType: invitation.sourceType,
            enrollmentId: invitation.sourceType === 'STUDY_GROUP' ? null : invitation.sourceId,
            studyGroupId: invitation.sourceType === 'STUDY_GROUP' ? invitation.sourceId : null,
            inviterId: invitation.inviter.id,
            inviteeId: invitation.invitee.id,
        };

        // check for duplication
        const existingInvitation = await this.prismaClient.invitation.findFirst({
            where: {
                ...newInvitation,
                tokenActionedDateTime: null,
            },
        });

        if (existingInvitation) {
            const message = 'Invitation already created';
            logger.warn({
                message,
                subjectId: this.loggedUser.id,
                resourceType: 'Invitation',
                source: 'createInvitation',
                action: 'create',
                context: { invitation: existingInvitation.id },
            });
            throw new UserInputError(message);
        }

        await this.validateIAM({
            action: 'create',
            resourceType: 'Invitation',
            resource: newInvitation,
        });

        const invitationToken = uid(12);

        // create invitation
        const createdInvitation = await this.prismaClient.invitation.create({
            data: {
                ...newInvitation,
                invitationToken,
                tokenIssuedDateTime: new Date(),
                status: 'PENDING',
            },
        });

        // send email with Invitation
        let emailTemplate: MessageTemplate;

        switch (createdInvitation.sourceType) {
            case 'ENROLLMENT': {
                if (invitation.existingStudent) {
                    emailTemplate = new InviteExistingStudentMessageTemplate({
                        studentName: invitation.invitee.firstName,
                        tutorName: invitation.inviter.firstName,
                        invitationLink: `${esloConfig.frontendUrl}/enrolled/active`,
                    });
                } else {
                    emailTemplate = new InviteStudentMessageTemplate({
                        studentName: invitation.invitee.firstName,
                        tutorName: invitation.inviter.firstName,
                        invitationLink: `${esloConfig.frontendUrl}/auth/register?invitationToken=${invitationToken}`,
                    });
                }

                esloMailService.sendEmailWithTemplate(invitation.invitee.primaryEmail, emailTemplate);

                const message = 'Invitation created';
                logger.warn({
                    message,
                    subjectId: this.loggedUser.id,
                    resourceType: 'Invitation',
                    source: 'createInvitation',
                    action: 'create',
                    context: { invitationToken },
                });

                break;
            }
            // case 'ENROLLMENT_TRANSFER': {}
            // case 'STUDY_GROUP': {}
            default:
                break;
        }
        return createdInvitation;
    }

    public async confirmInvitation(invitationToken: string): Promise<Invitation> {
        const invitation = await this.findByInvitationToken(invitationToken);
        if (invitation?.status !== 'PENDING') {
            const message = 'Invitation not found for token provided';
            logger.warn({
                message,
                subjectId: this.loggedUser.id,
                resourceType: 'Invitation',
                source: 'confirmInvitation',
                action: 'activate',
                context: { invitationToken },
            });
            throw new UserInputError(message);
        }

        const updatedInvitation = await this.prismaClient.invitation.update({
            where: { id: invitation.id },
            data: {
                status: 'ACCEPTED',
                tokenActionedDateTime: new Date(),
            },
        });
        return updatedInvitation;
    }

    public async cancelInvitation(invitationId: string): Promise<Invitation> {
        // update invitation
        const invitation = await this.prismaClient.invitation.findFirst({
            where: { id: invitationId },
        });

        if (!invitation) {
            throw new UserInputError('Invitation not found.');
        }

        await this.validateIAM({
            action: 'cancel',
            resourceType: 'Invitation',
            resource: invitation,
        });

        return this.prismaClient.invitation.update({
            data: { status: 'CANCELLED' },
            where: { id: invitation.id },
        });
    }
}
