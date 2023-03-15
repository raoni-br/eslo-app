import { extendType, inputObjectType, objectType } from 'nexus';

import { EsloContext } from '../context';
import { StudyGroup } from './study-group';
import { ClassRecord } from './class-record';
import { Enrollment } from './enrollment';
import { StudentSubscriptions } from './subscription';

export const ClassroomFiltersInput = inputObjectType({
    name: 'ClassroomFiltersInput',
    definition(t) {
        t.boolean('activeEnrollmentsOnly');
        t.string('studyGroupStatus');
    },
});

export const Student = objectType({
    name: 'Student',
    definition(t) {
        t.nonNull.id('id');
        t.string('firstName');
        t.string('familyName');
        t.string('displayName');
        t.string('primaryEmail');
        t.list.field('enrollments', {
            type: Enrollment,
            resolve: (parent, _, context: EsloContext) =>
                context.models.enrollment.findStudentEnrollmentsByUser(parent.id, parent.enrollmentStatusFilter),
        });
        t.list.field('subscriptions', {
            type: StudentSubscriptions,
            resolve: (parent, _, context: EsloContext) =>
                context.models.subscription.findByStudentId(parent.id, {
                    status: parent.subscriptionsStatusFilters.subscriptionsStatus,
                    expiringInDays: parent.subscriptionsStatusFilters.subscriptionsExpiringInDays,
                }),
        });
    },
});

export const Classroom = objectType({
    name: 'Classroom',
    definition(t) {
        t.nonNull.id('id'); // logger user
        t.field('classInProgress', {
            type: ClassRecord || null,
            resolve: (parent, _, context: EsloContext) =>
                context.models.classRecord.findClassInProgressByTeacher(parent.id),
        });
        t.list.field('studyGroups', {
            type: StudyGroup,
            resolve: (parent, _, context: EsloContext) =>
                context.models.studyGroup.findGroupsByTeacher(parent.studyGroupStatus),
        });
        t.list.field('students', {
            type: Student,
            resolve: (parent, _, context: EsloContext) =>
                context.models.classroom.findStudentsByTeacher(parent.activeEnrollmentsOnly),
        });
        t.list.field('studentEnrollments', {
            type: Enrollment,
            resolve: (parent, _, context: EsloContext) =>
                context.models.enrollment.findStudentEnrollmentsByUser(parent.id),
        });
    },
});

export const ClassroomQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('classroom', {
            type: Classroom,
            args: { filters: ClassroomFiltersInput },
            resolve: async (_parent, args, context: EsloContext) => context.models.classroom.getClassroom(args.filters),
        });
    },
});
