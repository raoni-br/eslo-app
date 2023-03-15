import { objectType, extendType, idArg, list } from 'nexus';

import { EsloContext } from '../context';
import { Level } from './level';

export const Media = objectType({
    name: 'Media',
    definition(t) {
        t.nonNull.id('id');
        t.string('mimeType');
        t.string('rootUri');
        t.string('smallFilename');
        t.string('mediumFilename');
        t.string('largeFilename');
        t.string('thumbnailFilename');
        t.string('altTxt');
    },
});

export const MediaAssociation = objectType({
    name: 'MediaAssociation',
    definition(t) {
        t.nonNull.int('order');
        t.nonNull.field('media', { type: Media });
    },
});

export const Activity = objectType({
    name: 'Activity',
    definition(t) {
        t.nonNull.int('order');
        t.nonNull.string('title');
        t.list.field('activitySlides', { type: MediaAssociation });
    },
});

export const LessonMaterial = objectType({
    name: 'LessonMaterial',
    definition(t) {
        t.field('lectureScript', { type: list(MediaAssociation) });
        t.list.field('studentBook', { type: MediaAssociation });
        t.list.field('audio', { type: MediaAssociation });
        t.list.field('activities', { type: Activity });
    },
});

export const ProviderLessonDetails = objectType({
    name: 'ProviderLessonDetails',
    definition(t) {
        t.string('rexCourse');
        t.string('rexPronunciationLesson');
        t.string('rexLanguage');
        t.string('rexKeyLanguage');
    },
});

export const ProviderInfo = objectType({
    name: 'ProviderInfo',
    definition(t) {
        t.string('providerCode');
        t.string('providerId');
        t.field('details', {
            type: ProviderLessonDetails,
            // eslint-disable-next-line no-unused-vars
            resolve: (parent, _, _context: EsloContext) => JSON.parse(parent.details),
        });
    },
});

export const Lesson = objectType({
    name: 'Lesson',
    definition(t) {
        t.nonNull.id('id');
        t.string('code');
        t.string('title');
        t.string('category');
        t.string('subject');
        t.string('slug');
        t.int('levelOrder');
        t.field('providerInfo', {
            type: ProviderInfo,
            // eslint-disable-next-line no-unused-vars
            resolve: (parent, _, _context: EsloContext) => JSON.parse(parent.providerInfo),
        });
        t.field('lessonMaterial', {
            type: LessonMaterial,
            // eslint-disable-next-line no-unused-vars
            resolve: (parent, _, _context: EsloContext) => JSON.parse(parent.lessonMaterial),
        });
        t.field('level', {
            type: Level,
            resolve: (parent, _, context: EsloContext) => context.models.level.findById(parent.levelId),
        });
    },
});

export const LessonQuery = extendType({
    type: 'Query',
    definition(t) {
        t.field('lesson', {
            type: Lesson,
            args: { id: idArg({ description: 'Lesson ID' }) },
            resolve: (_parent, args, context: EsloContext) => context.models.lesson.findById(args.id),
        });
    },
});
