import { objectType, extendType, idArg, inputObjectType } from 'nexus';

import { EsloContext } from '../context';
import { User } from './user';
import { Level } from './level';

import { Event, EventInput, EventOccurrence, ChangeScheduleInput, EventsInput } from './event';
import { Lesson } from './lesson';
import { ClassRecord } from './class-record';
import { StudyGroup } from './study-group';
import { IEventInput } from '../../../models/calendar.model';
import { Invitation } from './invitation';

const OneOnOneInput = inputObjectType({
    name: 'OneOnOneInput',
    definition(t) {
        t.nonNull.string('levelId');
        t.list.field('events', { type: EventInput });
    },
});

const EnrollmentInput = inputObjectType({
    name: 'EnrollmentInput',
    definition(t) {
        t.string('studyGroupId');
        t.field('oneOnOne', { type: OneOnOneInput });
    },
});

const StudentInput = inputObjectType({
    name: 'StudentInput',
    definition(t) {
        t.nonNull.string('email');
        t.nonNull.string('firstName');
        t.nonNull.string('surname');
    },
});

const AddStudentToGroupInput = inputObjectType({
    name: 'AddStudentToGroupInput',
    definition(t) {
        t.nonNull.string('id');
        t.nonNull.string('studyGroupId');
    },
});

export const Enrollment = objectType({
    name: 'Enrollment',
    definition(t) {
        t.nonNull.id('id');
        t.string('registrationDate');
        t.string('activationDate');
        t.string('status');
        t.string('externalKey');
        t.string('sourceType', {
            resolve: (parent) => (parent.studyGroupId ? 'STUDY_GROUP' : 'ENROLLMENT'),
        });
        t.field('level', {
            type: Level,
            resolve: (parent, _, context: EsloContext) => context.models.level.findById(parent.levelId),
        });
        t.field('teacher', {
            type: User,
            resolve: (parent, _, context: EsloContext) => context.models.user.findById(parent.teacherId),
        });
        t.field('student', {
            type: User,
            resolve: (parent, _, context: EsloContext) => context.models.user.findById(parent.studentId),
        });

        t.field('invitation', {
            type: Invitation,
            resolve: (parent, _, context: EsloContext) =>
                context.models.invitation.findBySource({
                    sourceId: parent.id,
                    sourceType: parent.studyGroupId ? 'STUDY_GROUP' : 'ENROLLMENT',
                }),
        });

        t.field('classInProgress', {
            type: ClassRecord,
            resolve: (parent, _args, context: EsloContext) =>
                context.models.classRecord.findClassInProgressByTeacher(parent.teacherId),
        });

        t.field('lastLesson', {
            type: ClassRecord,
            resolve: (parent, _, context: EsloContext) =>
                context.models.classRecord.findLastLessonBySource({ sourceType: 'ENROLLMENT', sourceId: parent.id }),
        });

        t.field('nextLesson', {
            type: Lesson,
            resolve: (parent, _, context: EsloContext) =>
                context.models.classRecord.findNextLessonBySource({ sourceType: 'ENROLLMENT', sourceId: parent.id }),
        });

        // Lesson tracker returning empty
        // TODO: modify object type to contain the enrollment so child resolver can access it.
        t.list.field('lessons', {
            type: Lesson,
            resolve: (parent, _, context: EsloContext) => context.models.lesson.findByLevel(parent.levelId),
        });

        t.list.field('classRecords', {
            type: ClassRecord,
            resolve: (parent, _, context: EsloContext) => context.models.classRecord.findAllByEnrollment(parent.id),
        });

        t.field('nextEventOccurrence', {
            type: EventOccurrence,
            resolve: (parent, _, context: EsloContext) =>
                context.models.calendar.findNextEventOccurrenceBySource({
                    sourceType: 'ENROLLMENT',
                    sourceId: parent.id,
                }),
        });

        t.list.field('events', {
            type: Event,
            resolve: (parent, _, context: EsloContext) =>
                context.models.calendar.findEventsBySource({
                    sourceType: 'ENROLLMENT',
                    sourceId: parent.id,
                }),
        });

        t.field('studyGroup', {
            type: StudyGroup || null,
            resolve: (parent, _, context: EsloContext) => {
                let studyGroup = null;
                if (parent.studyGroupId) {
                    studyGroup = context.models.studyGroup.findById(parent.studyGroupId);
                }
                return studyGroup;
            },
        });
    },
});

export const EnrollmentQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('enrollment', {
            type: Enrollment,
            args: { id: idArg({ description: 'Enrollment ID' }) },
            resolve: (_parent, args, context: EsloContext) => context.models.enrollment.findById(args.id),
        });
    },
});

export const ChangeEnrollmentScheduleMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('changeEnrollmentSchedule', {
            type: Enrollment,
            args: {
                changeScheduleInput: ChangeScheduleInput,
            },
            resolve: async (_root, args, context: EsloContext) => {
                await context.models.calendar.changeScheduleBySource({
                    sourceType: 'ENROLLMENT',
                    sourceId: args.changeScheduleInput.enrollmentId,
                    events: args.changeScheduleInput.events,
                });

                // return enrollment
                return context.models.enrollment.findById(args.changeScheduleInput.enrollmentId);
            },
        });
    },
});

export const CreateEnrollmentMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('createEnrollment', {
            type: Enrollment,
            args: {
                enrollmentInput: EnrollmentInput,
                invitedStudent: StudentInput,
            },
            resolve: async (_root, args, context: EsloContext) =>
                context.models.enrollment.createEnrollment(args.invitedStudent, args.enrollmentInput),
        });
    },
});

export const CancelEnrollmentMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('cancelEnrollment', {
            type: Enrollment,
            args: {
                id: idArg({ description: 'Enrollment ID' }),
            },
            resolve: async (_root, args, context: EsloContext) => context.models.enrollment.cancelEnrollment(args.id),
        });
    },
});

interface IRemoveStudentFromGroup {
    id: string;
    events: IEventInput[];
}

export const removeStudentFromGroup = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('removeStudentFromGroup', {
            type: Enrollment,
            args: {
                id: idArg({ description: 'Enrollment ID' }),
                events: EventsInput,
            },
            resolve: async (_root, args: IRemoveStudentFromGroup, context: EsloContext) =>
                context.models.enrollment.removeStudentFromGroup(args.id, args.events),
        });
    },
});

export const ActivateEnrollmentMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('activateEnrollment', {
            type: Enrollment,
            args: {
                enrollmentId: idArg({ description: 'Enrollment ID' }),
            },
            resolve: async (_root, args, context: EsloContext) =>
                context.models.enrollment.activateEnrollment(args.enrollmentId),
        });
    },
});

export const AddStudentToGroupMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('addStudentToGroup', {
            type: Enrollment,
            args: {
                enrollmentInput: AddStudentToGroupInput,
            },
            resolve: async (_root, args, context: EsloContext) =>
                context.models.enrollment.addStudentToGroup(args.enrollmentInput),
        });
    },
});
