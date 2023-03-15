import { extendType, inputObjectType, objectType } from 'nexus';
import { EsloContext } from '../context';
import { Student } from './classroom';
import { EventOccurrence } from './event';
import { Subscription } from './subscription';

export const DashboardFiltersInput = inputObjectType({
    name: 'DashboardFilters',
    definition(t) {
        t.string('enrollmentStatus');
        t.string('subscriptionsStatus');
        t.int('subscriptionsExpiringInDays');
    },
});

export const TeacherDashboard = objectType({
    name: 'TeacherDashboard',
    definition(t) {
        t.nonNull.id('id'); // logged user
        t.list.field('nextEvents', {
            type: EventOccurrence,
            resolve: (_root, _, context: EsloContext) => {
                const fromDate = new Date();
                const toDate = new Date();

                fromDate.setHours(0, 0, 0, 0);
                toDate.setHours(23, 59, 59, 999);

                return context.models.calendar.getMyCalendar(fromDate.toISOString(), toDate.toISOString());
            },
        });
        t.list.field('students', {
            type: Student,
            resolve: (parent, _, context: EsloContext) =>
                context.models.classroom.findStudentsByTeacher(parent.enrollmentStatus, {
                    subscriptionsStatus: parent.subscriptionsStatus,
                    subscriptionsExpiringInDays: parent.subscriptionsExpiringInDays,
                }),
        });
    },
});

export const StudentDashboard = objectType({
    name: 'StudentDashboard',
    definition(t) {
        t.nonNull.id('id'); // logged user
        t.field('nextEvent', {
            type: EventOccurrence,
            resolve: async (_root, _, context: EsloContext) => context.models.calendar.findNextEventOccurrenceByUser(),
        });
        t.list.field('subscriptions', {
            type: Subscription,
            resolve: (parent, _, context: EsloContext) =>
                context.models.subscription.findByUser(parent.id, {
                    status: parent.subscriptionsStatus,
                    expiringInDays: parent.subscriptionsExpiringInDays,
                }),
        });
    },
});

export const TeacherDashboardQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('teacherDashboard', {
            type: TeacherDashboard,
            args: { filters: DashboardFiltersInput },
            resolve: (_root, args, context: EsloContext) => context.models.dashboard.getDashboard(args.filters),
        });
    },
});

export const StudentDashboardQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('studentDashboard', {
            type: StudentDashboard,
            args: { filters: DashboardFiltersInput },
            resolve: (_root, args, context: EsloContext) => context.models.dashboard.getDashboard(args.filters),
        });
    },
});
