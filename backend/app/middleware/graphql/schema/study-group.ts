import { objectType, extendType, inputObjectType, stringArg } from 'nexus';

import { EsloContext } from '../context';
import { Enrollment } from './enrollment';
import { ChangeEventInput, Event, EventInput } from './event';
import { Lesson } from './lesson';
import { ClassRecord, StudyGroupClassRecord, StudyGroupTeacher } from './class-record';
import { Level } from './level';

export const UpdateStudyGroupInput = inputObjectType({
    name: 'UpdateStudyGroupInput',
    definition(t) {
        t.nonNull.id('studyGroupId');
        t.nonNull.string('name');
        t.list.field('events', { type: ChangeEventInput });
    },
});

export const CreateStudyGroupInput = inputObjectType({
    name: 'CreateStudyGroupInput',
    definition(t) {
        t.nonNull.string('name');
        t.nonNull.id('levelId');
        t.list.field('events', { type: EventInput });
    },
});

export const RemoveStudyGroupInput = inputObjectType({
    name: 'RemoveStudyGroupInput',
    definition(t) {
        t.nonNull.id('studyGroupId');
    },
});

export const StartStudyGroupClassInput = inputObjectType({
    name: 'StartStudyGroupClassInput',
    definition(t) {
        t.nonNull.id('studyGroupId');
        t.nonNull.string('lessonId');
        t.string('teacherNotes');
    },
});

export const StudyGroupAttendeeInput = inputObjectType({
    name: 'StudyGroupAttendeeInput',
    definition(t) {
        t.nonNull.string('studentId');
        t.boolean('attended');
    },
});

export const FinishStudyGroupClassInput = inputObjectType({
    name: 'FinishStudyGroupClassInput',
    definition(t) {
        t.nonNull.id('studyGroupClassRecordId');
        t.nonNull.string('status');
        t.string('teacherNotes');
        t.list.field('attendees', { type: StudyGroupAttendeeInput });
    },
});

export const StudyGroup = objectType({
    name: 'StudyGroup',
    definition(t) {
        t.nonNull.id('id');
        t.string('name');
        t.field('level', {
            type: Level,
            resolve: (parent, _, context: EsloContext) => context.models.level.findById(parent.levelId),
        });
        t.field('lastLesson', {
            type: StudyGroupClassRecord,
            resolve: (parent, _, context: EsloContext) =>
                context.models.classRecord.findLastLessonBySource({ sourceType: 'STUDY_GROUP', sourceId: parent.id }),
        });
        t.field('nextLesson', {
            type: Lesson,
            resolve: (parent, _, context: EsloContext) =>
                context.models.classRecord.findNextLessonBySource({ sourceType: 'STUDY_GROUP', sourceId: parent.id }),
        });
        t.list.field('enrollments', {
            type: Enrollment,
            resolve: (parent, _, context: EsloContext) => context.models.enrollment.findByStudyGroup(parent.id),
        });
        t.list.field('studyGroupTeachers', {
            type: StudyGroupTeacher,
            resolve: (parent, _, context: EsloContext) => context.models.studyGroup.findStudyGroupTeachers(parent.id),
        });
        t.list.field('studyGroupClassRecords', {
            type: StudyGroupClassRecord,
            resolve: (parent, _, context: EsloContext) =>
                context.models.studyGroup.findStudyGroupClassRecords(parent.id),
        });
        t.list.field('lessons', {
            type: Lesson,
            resolve: (parent, _, context: EsloContext) => context.models.lesson.findByLevel(parent.levelId),
        });
        t.list.field('events', {
            type: Event,
            resolve: (parent, _, context: EsloContext) =>
                context.models.calendar.findEventsBySource({ sourceType: 'STUDY_GROUP', sourceId: parent.id }),
        });
    },
});

export const StudyGroupClassAttendee = objectType({
    name: 'StudyGroupClassAttendee',
    definition(t) {
        t.nonNull.id('id');
        t.id('studentId');
        t.boolean('attended');
        t.field('studyGroupClassRecord', {
            type: StudyGroupClassRecord,
            resolve: (parent, _, context: EsloContext) =>
                context.models.studyGroup.findStudyGroupClassRecords(parent.studyGroupId),
        });
        t.field('classRecord', {
            type: ClassRecord,
            resolve: (parent, _, context: EsloContext) =>
                context.models.classRecord.findStudyGroupClassRecordById(parent.classRecordId),
        });
        t.field('student', {
            type: Enrollment,
            resolve: (parent, _, context: EsloContext) => context.models.enrollment.findById(parent.studentId),
        });
    },
});

export const CreateStudyGroupMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('createStudyGroup', {
            type: StudyGroup,
            args: {
                createGroupInput: CreateStudyGroupInput,
            },
            resolve: async (_root, args, context: EsloContext) =>
                context.models.studyGroup.createStudyGroup({
                    name: args.createGroupInput.name,
                    levelId: args.createGroupInput.levelId,
                    events: args.createGroupInput.events,
                }),
        });
    },
});

export const RemoveStudyGroupMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('removeStudyGroup', {
            type: StudyGroup,
            args: {
                removeGroupInput: RemoveStudyGroupInput,
            },
            resolve: async (_root, args, context: EsloContext) =>
                context.models.studyGroup.removeStudyGroup(args.removeGroupInput.studyGroupId),
        });
    },
});

export const findGroupsByTeacherQuery = extendType({
    type: 'Query',
    definition(t) {
        t.list.field('findGroupByTeacher', {
            type: StudyGroup,
            resolve: async (_root, args, context: EsloContext) => context.models.studyGroup.findGroupsByTeacher(),
        });
    },
});

export const findGroupByIdQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('findGroupById', {
            type: StudyGroup,
            args: {
                id: stringArg({ description: 'Group ID' }),
            },
            resolve: async (_root, args, context: EsloContext) => context.models.studyGroup.findById(args.id),
        });
    },
});

export const UpdateStudyGroupMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('updateStudyGroup', {
            type: StudyGroup,
            args: {
                studyGroupInput: UpdateStudyGroupInput,
            },
            resolve: async (_root, args, context: EsloContext) => {
                return context.models.studyGroup.updateStudyGroup(args.studyGroupInput);
            },
        });
    },
});
