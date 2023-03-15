import { objectType } from 'nexus';

import { EsloContext } from '../context';
import { Module } from './module';
import { Lesson, ProviderInfo } from './lesson';

export const LevelLayoutSettings = objectType({
    name: 'LevelLayoutSettings',
    definition(t) {
        t.string('svgImageUrl');
        t.string('icon');
        t.string('primaryColour');
        t.string('secondaryColour');
    },
});

export const Level = objectType({
    name: 'Level',
    definition(t) {
        t.nonNull.id('id');
        t.string('code');
        t.string('name');
        t.int('moduleOrder');
        t.string('description');
        t.string('label');
        t.field('providerInfo', {
            type: ProviderInfo,
            // eslint-disable-next-line no-unused-vars
            resolve: (parent, _, _context: EsloContext) => JSON.parse(parent.providerInfo),
        });
        t.field('layoutSettings', {
            type: LevelLayoutSettings,
            // eslint-disable-next-line no-unused-vars
            resolve: (parent, _, _context: EsloContext) => JSON.parse(parent.layoutSettings),
        });
        t.string('releasedAt');
        t.string('removedAt');
        t.field('module', {
            type: Module,
            resolve: (parent, _, context: EsloContext) => context.models.module.findById(parent.moduleId),
        });
        t.list.field('lessons', {
            type: Lesson,
            resolve: (parent, _, context: EsloContext) => context.models.lesson.findByLevel(parent.id),
        });
    },
});
