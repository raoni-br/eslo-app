import { objectType, extendType, idArg } from 'nexus';

import { EsloContext } from '../context';
import { Module } from './module';
import { ProviderInfo } from './lesson';

export const Program = objectType({
    name: 'Program',
    definition(t) {
        t.nonNull.id('id');
        t.string('code');
        t.string('name');
        t.field('providerInfo', {
            type: ProviderInfo,
            // eslint-disable-next-line no-unused-vars
            resolve: (parent, _, _context: EsloContext) => JSON.parse(parent.providerInfo),
        });
        t.string('releasedAt');
        t.string('removedAt');
        t.list.field('modules', {
            type: Module,
            resolve: (parent, _, context: EsloContext) => context.models.module.findByProgram(parent.id),
        });
        t.string('icon');
        t.string('label');
        t.string('description');
    },
});

export const ProgramQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('program', {
            type: Program,
            args: { id: idArg({ description: 'Program ID' }) },
            resolve: (_parent, args, context: EsloContext) => context.models.program.findById(args.id),
        });
    },
});

export const ProgramsQuery = extendType({
    type: 'Query',
    definition(t) {
        t.list.field('programs', {
            type: Program,
            resolve: (_parent, _, context: EsloContext) => context.models.program.findAll(),
        });
    },
});
