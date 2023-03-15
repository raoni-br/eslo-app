import { v4 as uuidv4 } from 'uuid';
import {
    AvailabilityType,
    EnrollmentStatus,
    LessonRecordStatus,
    EventStatus,
    EventVisibility,
    InvitationStatus,
    SourceType,
} from '.prisma/client';

import { prismaClient } from '..';

import dataDump from './seeders_data/production-backup.json';

export async function restoreProduction() {
    const { users, enrollments, events } = dataDump.data.adminDataExtractor;

    await prismaClient.$transaction(
        users.map((user) =>
            prismaClient.user.upsert({
                where: { id: user.id },
                update: {},
                create: {
                    id: user.id,
                    primaryEmail: user.primaryEmail,
                    firstName: user.firstName,
                    familyName: user.familyName,
                    displayName: user.displayName,
                    dateOfBirth: user.dateOfBirth ? new Date(parseInt(user.dateOfBirth, 10)) : null,
                    userAuthenticationList: {
                        createMany: {
                            data: [
                                {
                                    strategyCode: 'LOCAL',
                                    strategyId: user.primaryEmail,
                                    status: 'ACTIVE',
                                },
                                {
                                    strategyCode: 'REX',
                                    strategyId: user.id,
                                    status: 'ACTIVE',
                                },
                            ],
                        },
                    },
                    userIdentificationList: { createMany: { data: user.userIdentificationList } },
                    userAddresses: { createMany: { data: user.userAddresses } },
                    userPhoneNumbers: { createMany: { data: user.userPhoneNumbers } },
                },
            }),
        ),
    );

    await prismaClient
        .$transaction(
            enrollments.map((enrollment) =>
                prismaClient.enrollment.upsert({
                    where: { id: enrollment.id },
                    update: {},
                    create: {
                        id: enrollment.id,
                        registrationDate: new Date(parseInt(enrollment.registrationDate, 10)),
                        activationDate: enrollment.activationDate
                            ? new Date(parseInt(enrollment.activationDate, 10))
                            : null,
                        status: enrollment.status as EnrollmentStatus,
                        completedAt: enrollment.status === 'CANCELLED' ? new Date() : null,
                        externalKey: enrollment.externalKey,
                        studyGroupId: null,
                        levelId: enrollment.level.id,
                        teacherId: enrollment.teacher.id,
                        studentId: enrollment.student.id,
                        invitations: {
                            create: {
                                id: enrollment.invitation.id,
                                sourceType: enrollment.invitation.sourceType as SourceType,
                                studyGroupId: null,
                                status: enrollment.invitation.status as InvitationStatus,
                                inviterId: enrollment.invitation.inviter.id,
                                // not possible to retrieve token from GraphQL
                                invitationToken: `UNKNOWN-${enrollment.invitation.id}`,
                                tokenIssuedDateTime: new Date(),
                                tokenActionedDateTime: new Date(),
                                inviteeId: enrollment.student.id,
                            },
                        },
                        classRecords: {
                            createMany: {
                                data: enrollment.lessonTrackerRecord.map((lt) => ({
                                    id: lt.id,
                                    lessonId: lt.lesson.id,
                                    teacherNotes: lt.teacherNotes,
                                    status: lt.status as LessonRecordStatus,
                                    startedAt: lt.startedAt ? new Date(parseInt(lt.startedAt, 10)) : null,
                                    completedAt: lt.completedAt ? new Date(parseInt(lt.completedAt, 10)) : null,
                                    lessonStartedAt: lt.startedAt ? new Date(parseInt(lt.startedAt, 10)) : null,
                                    lessonEndedAt: lt.completedAt ? new Date(parseInt(lt.completedAt, 10)) : null,
                                })),
                            },
                        },
                    },
                }),
            ),
        )
        .catch((error) => {
            throw error;
        });

    await prismaClient
        .$transaction(
            events
                .filter((ev) => {
                    const enrollmentIndex = enrollments.findIndex(
                        (e) => typeof e.student?.id === 'string' && e.id === ev.sourceId,
                    );

                    return ev.sourceType === 'STUDY_GROUP' || enrollmentIndex >= 0;
                })
                .map((event) =>
                    prismaClient.event.upsert({
                        where: { id: event.id },
                        update: {},
                        create: {
                            id: event.id,
                            title: event.title,
                            description: event.description,
                            availabilityType: event.availabilityType as AvailabilityType,
                            sourceType: event.sourceType as SourceType,
                            enrollmentId: event.sourceType === 'ENROLLMENT' ? event.sourceId : null,
                            studyGroupId: event.sourceType === 'STUDY_GROUP' ? event.sourceId : null,
                            startDateTime: new Date(parseInt(event.startDateTime, 10)),
                            startTimeZone: event.startTimeZone,
                            endDateTime: new Date(parseInt(event.endDateTime, 10)),
                            endTimeZone: event.endTimeZone,
                            status: event.status as EventStatus,
                            sendNotifications: event.sendNotifications,
                            startedAt: new Date(parseInt(event.startDateTime, 10)),
                            completedAt: null, // event.completedAt ? new Date(parseInt(event.completedAt, 10))
                            visibility: event.visibility as EventVisibility,
                            recurrence: event.recurrence,
                            organiserId: event.organiser.id,
                            ownerId: event.owner.id,
                            eventAttendees: {
                                create: {
                                    id: uuidv4(),
                                    responseStatus: 'ACCEPTED',
                                    responseDateTime: new Date(parseInt(event.startDateTime, 10)),
                                    attendeeId: event.owner.id,
                                    organiser: true,
                                },
                            },
                        },
                    }),
                ),
        )
        .catch((error) => {
            throw error;
        });
}
