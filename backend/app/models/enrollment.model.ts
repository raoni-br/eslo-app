import { Prisma, Enrollment, EnrollmentStatus } from '@prisma/client';
import { UserInputError, ApolloError } from 'apollo-server-express';

import { logger } from '../utils/logger';

import { esloMailService } from '../services/messaging/email-engine';
import { ActivateStudentMessageTemplate } from '../services/messaging/templates/activate-student';

import { EsloModel } from './eslo.model';
import { CalendarModel, IEventInput } from './calendar.model';
import { ClassRecordModel } from './class-record.model';
import { UserProfileModel, UserWithSubscription } from './user-profile.model';
import { InvitationModel } from './invitation.model';
import { StudyGroupModel } from './study-group.model';
import { LevelModel } from './level.model';

// Prisma only exposes models with raw attributes.
// When using relations (i.e. include: {})a custom type must be defined
export type EnrollmentWithStudent = Prisma.EnrollmentGetPayload<{
    include: {
        student: true;
    };
}>;

export interface IStudentInput {
    email: string;
    firstName: string;
    surname: string;
}

interface IEnrollmentInput {
    // TODO: create EnrollmentType (GROUP | ONE_ON_ONE | SELF_PACED)
    studyGroupId?: string;
    oneOnOne?: {
        levelId: string;
        events: IEventInput[];
    };
}

interface IJoinGroupInput {
    id: string;
    studyGroupId: string;
}

export class EnrollmentModel extends EsloModel {
    constructor(loggedUser: UserWithSubscription) {
        super(loggedUser, 'enrollment');
    }

    private static filterActive(): object {
        return {
            completedAt: null,
            deletedAt: null,
        };
    }

    public async findById(id: string): Promise<Enrollment | null> {
        const enrollment = await this.prismaClient.enrollment.findUnique({
            where: { id },
            include: { studyGroup: { include: { studyGroupTeachers: true } } },
        });

        if (!enrollment) {
            return null;
        }

        await this.validateIAM({
            action: 'read',
            resourceType: 'Enrollment',
            resource: enrollment,
        });

        return enrollment;
    }

    public async findActiveById(id: string): Promise<Enrollment | null> {
        const enrollment = await this.findById(id);

        if (!enrollment || enrollment.status !== 'ACTIVE') {
            return null;
        }
        return enrollment;
    }

    public async findAll(): Promise<Enrollment[]> {
        const iamPermission = await this.validateIAM({
            action: 'list',
            resourceType: 'Enrollment',
        });

        return this.prismaClient.enrollment.findMany({
            where: { AND: { ...iamPermission.filter } },
        });
    }

    public async findByStudyGroup(studyGroupId: string): Promise<Enrollment[]> {
        const iamPermission = await this.validateIAM({
            action: 'list',
            resourceType: 'Enrollment',
        });

        return this.prismaClient.enrollment.findMany({
            where: { AND: { ...iamPermission.filter }, studyGroupId },
        });
    }

    public async findTeacherEnrollmentsByUser(
        userId: string,
        activeEnrollmentsOnly: boolean = true,
    ): Promise<EnrollmentWithStudent[]> {
        const iamPermission = await this.validateIAM({
            action: 'list',
            resourceType: 'Enrollment',
        });

        let filterStatus = {};
        if (activeEnrollmentsOnly) {
            filterStatus = EnrollmentModel.filterActive();
        }

        return this.prismaClient.enrollment.findMany({
            where: {
                AND: { ...iamPermission.filter },
                ...filterStatus,
                OR: [
                    {
                        studyGroup: {
                            studyGroupTeachers: {
                                some: {
                                    teacherId: userId,
                                },
                            },
                        },
                    },
                    {
                        teacherId: userId,
                    },
                ],
            },
            orderBy: [{ status: 'asc' }, { student: { firstName: 'asc' } }],
            include: { student: true },
        });
    }

    public async findStudentEnrollmentsByUser(userId: string, status?: EnrollmentStatus): Promise<Enrollment[]> {
        const iamPermission = await this.validateIAM({
            action: 'list',
            resourceType: 'Enrollment',
        });

        let filterStatus = {};
        if (status) {
            filterStatus = { status };
        }

        return this.prismaClient.enrollment.findMany({
            where: {
                AND: { ...iamPermission.filter },
                studentId: userId,
                ...filterStatus,
            },
            orderBy: [{ status: 'asc' }],
        });
    }

    /**
     * Create a new student enrollment for one on one or group classes.
     * Student (user) is created if not yet registered on the platform and and invitation is sent to their email.
     * The enrollment is created with ACTIVE status so teachers can manage it straightaway (e.g. book classes, change schedule, etc.).
     * The student needs to confirm the enrollment in order to access it.
     * @param invitedStudent {IStudentInput}
     * @param enrollmentInput {IEnrollmentInput}
     * @returns {Enrollment}
     */
    public async createEnrollment(
        invitedStudent: IStudentInput,
        enrollmentInput: IEnrollmentInput,
    ): Promise<Enrollment> {
        if (!enrollmentInput.oneOnOne && !enrollmentInput.studyGroupId) {
            throw new UserInputError('You must inform either the group or one-on-one details');
        }

        if (enrollmentInput.oneOnOne && enrollmentInput.studyGroupId) {
            throw new UserInputError('You cannot create a enrollment that is both group and one-on-one');
        }

        await this.validateIAM({
            action: 'create',
            resourceType: 'Enrollment',
        });

        const teacher = this.loggedUser;
        let levelId: string;
        if (enrollmentInput.studyGroupId) {
            // validate Study Group
            const studyGroupModel = new StudyGroupModel(this.loggedUser);
            const studyGroup = await studyGroupModel.findById(enrollmentInput.studyGroupId);

            if (!studyGroup) {
                const message = 'Study group not found';
                logger.warn({
                    message,
                    subjectId: this.loggedUser.id,
                    resourceType: 'Enrollment',
                    source: 'createEnrollment',
                    action: 'create',
                    context: { studyGroup: enrollmentInput.studyGroupId },
                });
                throw new UserInputError(message);
            }

            levelId = studyGroup.levelId;
        } else {
            const levelModel = new LevelModel(this.loggedUser);
            const level = await levelModel.findById(enrollmentInput.oneOnOne?.levelId || '');

            if (!level) {
                const message = 'Level not found';
                logger.warn({
                    message,
                    subjectId: this.loggedUser.id,
                    resourceType: 'Enrollment',
                    source: 'createEnrollment',
                    action: 'create',
                    context: { level: enrollmentInput.oneOnOne?.levelId },
                });
                throw new UserInputError(message);
            }

            levelId = level.id;

            if (!enrollmentInput.oneOnOne?.events) {
                const message = 'Events not provided';
                logger.warn({
                    message,
                    subjectId: this.loggedUser.id,
                    resourceType: 'Enrollment',
                    source: 'createEnrollment',
                    action: 'create',
                });
                throw new UserInputError(message);
            }
        }

        // Create student if not yet created
        let existingStudent = true;
        const userModel = new UserProfileModel(this.loggedUser);
        let student = await userModel.findByEmail(invitedStudent.email);

        if (!student) {
            existingStudent = false;
            student = await userModel.createUser({
                primaryEmail: invitedStudent.email,
                firstName: invitedStudent.firstName,
                familyName: invitedStudent.surname,
                displayName: invitedStudent.firstName,
            });
        }

        if (!student) {
            const message = 'Error while creating student profile';
            logger.error({
                message,
                subjectId: this.loggedUser.id,
                resourceType: 'Enrollment',
                source: 'createEnrollment',
                action: 'create',
                context: { studentEmail: invitedStudent.email },
            });
            throw new ApolloError(message);
        }

        // create enrollment
        const enrollment = await this.prismaClient.enrollment.create({
            data: {
                teacherId: teacher.id,
                studentId: student.id,
                status: 'ACTIVE',
                registrationDate: new Date(),
                levelId,
                studyGroupId: enrollmentInput.studyGroupId,
            },
        });

        // create events (oneOnOne)
        if (enrollmentInput.oneOnOne && enrollmentInput.oneOnOne?.events) {
            const calendarModel = new CalendarModel(this.loggedUser);
            await calendarModel.createEventsBySource({
                source: {
                    sourceId: enrollment.id,
                    sourceType: 'ENROLLMENT',
                },
                events: enrollmentInput.oneOnOne.events,
                status: 'CONFIRMED', // create events with confirmed status
            });
        }

        // Create invitation
        const invitationModel = new InvitationModel(this.loggedUser);
        await invitationModel.createInvitation({
            sourceType: 'ENROLLMENT',
            sourceId: enrollment.id,
            inviter: this.loggedUser,
            invitee: student,
            existingStudent,
        });

        return enrollment;
    }

    /**
     * The student can activate an enrollment so they can access the content.
     * For the teacher however, there is no difference between a confirmed or an active enrollment.
     * Upon activation, the calendar events will be confirmed for the student and the invitation accepted.
     * @param enrollmentId {string}
     * @returns {Enrollment}
     */
    public async activateEnrollment(enrollmentId: string): Promise<Enrollment> {
        const enrollment = await this.findById(enrollmentId);

        await this.validateIAM({
            action: 'activate',
            resourceType: 'Enrollment',
            resource: enrollment,
        });

        if (!enrollment) {
            const message = 'Enrollment not found';
            logger.warn({
                message,
                subjectId: this.loggedUser.id,
                resourceType: 'Enrollment',
                source: 'activateEnrollment',
                action: 'activate',
                context: { enrollment: enrollmentId },
            });

            throw new UserInputError(message);
        }

        if (enrollment.status !== 'ACTIVE') {
            const message = 'Enrollment is already active or has been cancelled';
            logger.warn({
                message,
                subjectId: this.loggedUser.id,
                resourceType: 'Enrollment',
                source: 'activateEnrollment',
                action: 'activate',
                context: { enrollment: enrollmentId },
            });
            throw new UserInputError(message);
        }

        const updatedEnrollment = await this.prismaClient.enrollment.update({
            where: { id: enrollment.id },
            data: {
                status: 'CONFIRMED',
                activationDate: new Date(),
            },
            include: { student: true },
        });

        // confirm attendance from study group or event from enrollment
        const calendarModel = new CalendarModel(this.loggedUser);
        await calendarModel.confirmEnrollmentEvents(enrollment);

        // TODO: update email when student activates enrollment
        const activateStudentMessageTemplate = new ActivateStudentMessageTemplate({
            studentName: updatedEnrollment.student.firstName,
            activationUrl: '',
        });

        // confirm invitation
        const invitationModel = new InvitationModel(this.loggedUser);
        const invitation = await invitationModel.findBySource({ sourceType: 'ENROLLMENT', sourceId: enrollment.id });
        if (invitation && invitation.status === 'PENDING') {
            invitationModel.confirmInvitation(invitation.invitationToken);
        }

        esloMailService.sendEmailWithTemplate(updatedEnrollment.student?.primaryEmail, activateStudentMessageTemplate);

        const message = 'Enrollment activated';
        logger.info({
            message,
            subjectId: this.loggedUser.id,
            resourceType: 'Enrollment',
            source: 'activateEnrollment',
            action: 'activate',
            context: { enrollment: enrollmentId },
        });

        return updatedEnrollment;
    }

    public async addStudentToGroup(enrollmentInput: IJoinGroupInput): Promise<Enrollment> {
        const enrollment = await this.findById(enrollmentInput.id);

        if (!enrollment) {
            throw new UserInputError('Enrollment not found');
        }

        if (enrollment.studyGroupId) {
            throw new UserInputError('Enrollment is already part of a studyGroup');
        }

        const studyGroupModel = new StudyGroupModel(this.loggedUser);
        const studyGroup = await studyGroupModel.findById(enrollmentInput.studyGroupId);

        if (!studyGroup) {
            throw new UserInputError('Study group not found');
        }

        if (enrollment.levelId !== studyGroup.levelId) {
            throw new UserInputError('The enrollment can only be part of a group with the same level');
        }

        await this.validateIAM({
            action: 'update',
            resourceType: 'Enrollment',
            resource: enrollment,
        });

        // cancel events
        const calendarModel = new CalendarModel(this.loggedUser);
        calendarModel.cancelAllEventsBySource({ sourceType: 'ENROLLMENT', sourceId: enrollment.id });

        // TODO: send email to student

        // add to study group
        // teacherId to null?
        // what to do in cases where enrollment and study group history differ
        return this.prismaClient.enrollment.update({
            where: { id: enrollment.id },
            data: { studyGroupId: studyGroup.id },
        });
    }

    public async removeStudentFromGroup(id: string, events: IEventInput[]): Promise<Enrollment> {
        const enrollment = await this.findById(id);

        if (!enrollment) {
            throw new UserInputError('Enrollment not found');
        }

        if (events.length === 0) {
            throw new UserInputError('There must be events for the one on one classes');
        }

        if (!enrollment.studyGroupId) {
            throw new UserInputError('Enrollment is not part of a study group');
        }

        const studyGroupModel = new StudyGroupModel(this.loggedUser);
        const studyGroup = await studyGroupModel.findById(enrollment.studyGroupId);

        if (!studyGroup) {
            const message = 'Study group could not be retrieved for this enrollment';
            logger.error({
                message,
                subjectId: this.loggedUser.id,
                resourceType: 'StudyGroupClassAttendee',
                source: 'removeStudentFromGroup',
                action: 'delete',
                context: { enrollment: enrollment.id, studyGroup: enrollment.studyGroupId },
            });
            throw new ApolloError(message);
        }

        await this.validateIAM({
            action: 'update',
            resourceType: 'Enrollment',
            resource: enrollment,
        });

        // create events
        const calendarModel = new CalendarModel(this.loggedUser);
        await calendarModel.createEventsBySource({
            source: {
                sourceType: 'ENROLLMENT',
                sourceId: enrollment.id,
            },
            events,
            status: 'CONFIRMED',
        });

        // TODO: send email to student

        // remove from study group
        return this.prismaClient.enrollment.update({
            where: { id: enrollment.id },
            data: { studyGroupId: null },
        });
    }

    public async cancelEnrollment(id: string): Promise<Enrollment> {
        // find enrollment
        const enrollment = await this.findById(id);

        if (!enrollment) {
            throw new UserInputError(`Enrollment not found`);
        }

        if (!['PENDING', 'ACTIVE'].includes(enrollment.status)) {
            throw new UserInputError(`Enrollment can only be cancelled when pending or active`);
        }

        await this.validateIAM({
            action: 'cancel',
            resourceType: 'Enrollment',
            resource: enrollment,
        });

        const classRecordModel = new ClassRecordModel(this.loggedUser);

        // find lesson in progress
        const classInProgress = await classRecordModel.findClassInProgressBySource({
            sourceType: 'ENROLLMENT',
            sourceId: enrollment.id,
        });
        if (classInProgress) {
            const message = 'There is a lesson in progress for this enrollment';
            logger.warn({
                message,
                subjectId: this.loggedUser.id,
                resourceType: 'Enrollment',
                source: 'cancelEnrollment',
                action: 'cancel',
                context: { enrollment: enrollment.id, classInProgress: classInProgress.id },
            });
            throw new UserInputError(message);
        }

        // cancel invitation
        if (enrollment.status === 'PENDING') {
            const invitationModel = new InvitationModel(this.loggedUser);
            const invitation = await invitationModel.findBySource({
                sourceType: 'ENROLLMENT',
                sourceId: enrollment.id,
            });

            if (invitation) {
                await invitationModel.cancelInvitation(invitation.id);
            }
        }

        // cancel enrollment
        const cancelledEnrollment = await this.prismaClient.enrollment.update({
            data: {
                status: 'CANCELLED',
                completedAt: new Date(),
            },
            where: {
                id: enrollment.id,
            },
        });

        // cancel events
        const calendarModel = new CalendarModel(this.loggedUser);
        calendarModel.cancelAllEventsBySource({ sourceType: 'ENROLLMENT', sourceId: enrollment.id });

        // TODO: send e-mail
        const message = 'Enrollment cancelled';
        logger.info({
            message,
            subjectId: this.loggedUser.id,
            resourceType: 'Enrollment',
            source: 'cancelEnrollment',
            action: 'cancel',
            context: { enrollment: enrollment.id },
        });

        return cancelledEnrollment;
    }
}
