import { extendType, objectType } from 'nexus';

import { EsloContext } from '../context';
import { Enrollment } from './enrollment';
import { Event } from './event';
import { StudyGroup } from './study-group';
import { User } from './user';

export const AdminAppData = objectType({
    name: 'AppData',
    definition(t) {
        t.id('id');
        t.list.field('users', { type: User });
        t.list.field('studyGroups', { type: StudyGroup });
        t.list.field('enrollments', { type: Enrollment });
        t.list.field('events', { type: Event });
    },
});

export const AdminDataExtractorQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('adminDataExtractor', {
            type: AdminAppData,
            resolve: async (_parent, _, context: EsloContext) => context.models.admin.extractData(),
        });
    },
});
