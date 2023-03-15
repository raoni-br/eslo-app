import { objectType } from 'nexus';

import { EsloContext } from '../context';
import { Program } from './program';
import { Level } from './level';
import { ProviderInfo } from './lesson';

export const Module = objectType({
    name: 'Module',
    definition(t) {
        t.nonNull.id('id');
        t.string('code');
        t.string('name');
        t.int('programOrder');
        t.string('description');
        t.field('providerInfo', {
            type: ProviderInfo,
            // eslint-disable-next-line no-unused-vars
            resolve: (parent, _, _context: EsloContext) => JSON.parse(parent.providerInfo),
        });
        t.string('releasedAt');
        t.string('removedAt');
        t.field('program', {
            type: Program,
            resolve: (parent, _, context: EsloContext) => context.models.program.findById(parent.programId),
        });
        t.list.field('levels', {
            type: Level,
            resolve: (parent, _, context: EsloContext) => context.models.level.findByModule(parent.id),
        });
    },
});
