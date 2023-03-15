import { inputObjectType, objectType, extendType, unionType, interfaceType } from 'nexus';

import { EsloContext } from '../context';
import { Enrollment } from './enrollment';
import { Lesson } from './lesson';
import { StudyGroupAttendeeInput, StudyGroup, StudyGroupClassAttendee } from './study-group';
import { User } from './user';

export const StartClassInput = inputObjectType({
    name: 'StartClassInput',
    definition(t) {
        t.nonNull.string('sourceType');
        t.nonNull.string('sourceId');
        t.string('levelId');
        t.string('lessonId');
        t.string('teacherNotes');
    },
});

export const FinishClassInput = inputObjectType({
    name: 'FinishClassInput',
    definition(t) {
        t.nonNull.string('classRecordId');
        t.nonNull.string('sourceType');
        t.nonNull.string('sourceId');
        t.string('teacherNotes');
        t.string('status');
        t.string('lessonStartedAt');
        t.string('lessonEndedAt');
        t.list.field('attendees', { type: StudyGroupAttendeeInput });
    },
});

export const EditFinishedClassInput = inputObjectType({
    name: 'EditFinishedClassInput',
    definition(t) {
        t.nonNull.string('classRecordId');
        t.nonNull.string('sourceType');
        t.nonNull.string('sourceId');
        t.string('teacherNotes');
        t.string('lessonStartedAt');
        t.string('lessonEndedAt');
        t.list.field('attendees', { type: StudyGroupAttendeeInput });
    },
});

export const RevertFinishedClassStatusInput = inputObjectType({
    name: 'RevertFinishedClassStatusInput',
    definition(t) {
        t.nonNull.string('classRecordId');
        t.nonNull.string('sourceType');
        t.nonNull.string('sourceId');
    },
});

export const RevertLessonStatusInput = inputObjectType({
    name: 'RevertLessonStatusInput',
    definition(t) {
        t.nonNull.id('sourceId');
        t.nonNull.string('sourceType');
        t.nonNull.string('lessonId');
    },
});

export const ClassRecord = unionType({
    name: 'ClassRecord',
    resolveType(parent) {
        return 'enrollmentId' in parent ? 'EnrollmentClassRecord' : 'StudyGroupClassRecord';
    },
    definition(t) {
        t.members('EnrollmentClassRecord', 'StudyGroupClassRecord');
    },
});

export const ClassRecordInterface = interfaceType({
    name: 'ClassRecordInterface',
    resolveType(parent) {
        return 'enrollmentId' in parent ? 'EnrollmentClassRecord' : 'StudyGroupClassRecord';
    },
    definition(t) {
        t.nonNull.id('id');
        t.string('teacherNotes');
        t.string('status');
        t.string('startedAt');
        t.string('completedAt');
        t.string('lessonStartedAt');
        t.string('lessonEndedAt');
        t.string('deletedAt');
        t.nonNull.field('lesson', {
            type: Lesson,
            resolve: (parent, _, context: EsloContext) => context.models.lesson.findById(parent.lessonId),
        });
    },
});

export const EnrollmentClassRecord = objectType({
    name: 'EnrollmentClassRecord',
    definition(t) {
        t.implements('ClassRecordInterface');
        t.nonNull.string('enrollmentId');
        t.field('enrollment', {
            type: Enrollment,
            resolve: (parent, _, context: EsloContext) => context.models.enrollment.findById(parent.enrollmentId),
        });
        t.boolean('revertClassStatus', {
            resolve: (parent, _, context: EsloContext) =>
                context.models.classRecord.canRevertClassRecord(
                    { sourceType: 'ENROLLMENT', sourceId: parent.enrollmentId },
                    parent.id,
                ),
        });
    },
});

export const StudyGroupClassRecord = objectType({
    name: 'StudyGroupClassRecord',
    definition(t) {
        t.implements('ClassRecordInterface');
        t.nonNull.string('studyGroupId');
        t.field('studyGroup', {
            type: StudyGroup,
            resolve: (parent, _, context: EsloContext) => context.models.studyGroup.findById(parent.studyGroupId),
        });
        t.list.field('studyGroupClassAttendees', {
            type: StudyGroupClassAttendee,
            resolve: (parent, _, context: EsloContext) =>
                context.models.studyGroup.findStudyGroupClassAttendees(parent.id),
        });
        t.boolean('revertClassStatus', {
            resolve: (parent, _, context: EsloContext) =>
                context.models.classRecord.canRevertClassRecord(
                    { sourceType: 'STUDY_GROUP', sourceId: parent.studyGroupId },
                    parent.id,
                ),
        });
    },
});

export const StudyGroupTeacher = objectType({
    name: 'StudyGroupTeacher',
    definition(t) {
        t.nonNull.id('id');
        t.field('studyGroup', {
            type: StudyGroup,
            resolve: (parent, _, context: EsloContext) => context.models.studyGroup.findById(parent.studyGroupId),
        });
        t.list.field('studyGroupClassRecord', {
            type: StudyGroupClassRecord,
            resolve: (parent, _, context: EsloContext) =>
                context.models.studyGroup.findStudyGroupClassRecords(parent.studyGroupId),
        });
        t.field('teacher', {
            type: User,
            resolve: (parent, _, context: EsloContext) => context.models.user.findById(parent.teacherId),
        });
    },
});

export const FinishedLesson = objectType({
    name: 'FinishedLesson',
    definition(t) {
        t.field('finishedLesson', {
            type: ClassRecord,
            resolve: async (parent, _, context: EsloContext) => {
                let finishedLesson = null;
                if (parent.studyGroupId) {
                    finishedLesson = await context.models.classRecord.findLastLessonBySource({
                        sourceType: 'STUDY_GROUP',
                        sourceId: parent.studyGroupId,
                    });
                }
                if (parent.enrollmentId) {
                    finishedLesson = await context.models.classRecord.findLastLessonBySource({
                        sourceType: 'ENROLLMENT',
                        sourceId: parent.enrollmentId,
                    });
                }
                return finishedLesson;
            },
        });
    },
});

export const StartClassMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('startClass', {
            type: ClassRecord,
            args: {
                startClassInput: StartClassInput,
            },
            resolve: async (_root, args, context: EsloContext) =>
                context.models.classRecord.startClass(args.startClassInput),
        });
    },
});

export const FinishClassMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('finishClass', {
            type: ClassRecord,
            args: {
                finishClassInput: FinishClassInput,
            },
            resolve: async (_root, args, context: EsloContext) =>
                context.models.classRecord.finishClass(args.finishClassInput),
        });
    },
});

export const editFinishedClassMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('editFinishedClass', {
            type: ClassRecord,
            args: {
                editFinishedClassInput: EditFinishedClassInput,
            },
            resolve: async (_root, args, context: EsloContext) =>
                context.models.classRecord.editFinishedClass(args.editFinishedClassInput),
        });
    },
});

export const revertFinishedClassStatusMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('revertFinishedClassStatus', {
            type: ClassRecord,
            args: {
                revertFinishedClassStatusInput: RevertFinishedClassStatusInput,
            },
            resolve: async (_root, args, context: EsloContext) =>
                context.models.classRecord.revertFinishedClassStatus(args.revertFinishedClassStatusInput),
        });
    },
});

export const revertLessonStatusMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.field('revertLessonStatus', {
            type: Lesson,
            args: {
                revertLessonStatusInput: RevertLessonStatusInput,
            },
            resolve: async (_root, args, context: EsloContext) =>
                context.models.classRecord.revertLessonStatus(args.revertLessonStatusInput),
        });
    },
});
