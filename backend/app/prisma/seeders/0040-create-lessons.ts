import { PrismaPromise } from '@prisma/client';

import { prismaClient } from '..';

import lessons from './seeders_data/v1.0.0/json/lesson.json';
import activities from './seeders_data/v1.0.0/json/activity.json';

const bookPages = [1, 2];
const bucketUrl = 'https://storage.googleapis.com/eslo-platform-material-dev/EE/v1.0.0';

function insertLessons(): PrismaPromise<any>[] {
    return lessons.map((lesson) =>
        prismaClient.lesson.upsert({
            where: { id: lesson.id },
            update: {},
            create: {
                id: lesson.id,
                code: lesson.code,
                title: lesson.title,
                category: lesson.category,
                levelOrder: parseInt(lesson.level_order, 10),
                levelId: lesson.level_id,
                subject: lesson.subject,
                slug: lesson.slug,
                providerInfo: JSON.stringify({
                    providerCode: lesson.provider_code,
                    providerId: lesson.provider_id,
                    details: {
                        rexCourse: lesson.rex_course,
                        rexPronunciationLesson: lesson.rex_pp_lesson,
                        rexLanguage: lesson.rex_language,
                        rexKeyLanguage: lesson.rex_key_language,
                    },
                }),
                lessonMaterial: JSON.stringify({
                    lectureScript: bookPages.map((page) => ({
                        order: page,
                        media: {
                            id: `${lesson.code}-script-${page}`,
                            mimeType: 'image/png',
                            rootUri: `${bucketUrl}/${lesson.code.substr(
                                0,
                                9,
                            )}/${lesson.code.toLowerCase()}-script-${page}.png`,
                            smallFilename: '',
                            mediumFilename: '',
                            largeFilename: '',
                            thumbnailFilename: '',
                            altTxt: '',
                        },
                    })),
                    studentBook: bookPages.map((page) => ({
                        order: page,
                        media: {
                            id: `${lesson.code}-book-${page}`,
                            mimeType: 'image/png',
                            rootUri: `${bucketUrl}/${lesson.code.substr(
                                0,
                                9,
                            )}/${lesson.code.toLowerCase()}-book-${page}.png`,
                            smallFilename: '',
                            mediumFilename: '',
                            largeFilename: '',
                            thumbnailFilename: '',
                            altTxt: '',
                        },
                    })),
                    activities: activities
                        .filter((activity) => activity.lesson_code === lesson.code && activity.slides_count)
                        .map((activity) => ({
                            order: activity.lesson_order,
                            title: activity.title,
                            activitySlides: Array.from(Array(parseInt(activity.slides_count, 10)), (v, k) => ({
                                order: k + 1,
                                media: {
                                    id: `${activity.code}-${k + 1}`,
                                    mimeType: 'image/png',
                                    // eslint-disable-next-line max-len
                                    rootUri: `${bucketUrl}/${lesson.code.substr(
                                        0,
                                        9,
                                    )}/${activity.code.toLowerCase()}-slide-${k + 1}.png`,
                                    smallFilename: '',
                                    mediumFilename: '',
                                    largeFilename: '',
                                    thumbnailFilename: '',
                                    altTxt: '',
                                },
                            })),
                        })),
                    audio: Array.from(Array(parseInt(lesson.audio_count, 10)), (v, k) => ({
                        order: k + 1,
                        media: {
                            id: `${lesson.code}-${k + 1}`,
                            mimeType: 'audio/mpeg',
                            rootUri: `${bucketUrl}/${lesson.code.substr(0, 9)}/${lesson.code.toLowerCase()}-audio-${
                                k + 1
                            }.mp3`,
                            smallFilename: '',
                            mediumFilename: '',
                            largeFilename: '',
                            thumbnailFilename: '',
                            altTxt: '',
                        },
                    })),
                }),
                // lesson_image: {},
                createdAt: new Date(),
            },
        }),
    );
}

function deleteLessons(): PrismaPromise<any> {
    return prismaClient.lesson.deleteMany({
        where: {
            id: {
                in: lessons.map((lesson) => lesson.id),
            },
        },
    });
}

export { insertLessons, deleteLessons };
