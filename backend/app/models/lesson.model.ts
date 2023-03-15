import { Lesson } from '@prisma/client';

import { EsloModel } from './eslo.model';
import { UserWithSubscription } from './user-profile.model';

export class LessonModel extends EsloModel {
    constructor(loggedUser: UserWithSubscription) {
        super(loggedUser, 'lms');
    }

    private async canReadLesson(lesson: Lesson): Promise<boolean> {
        await this.validateIAM({
            action: 'read',
            resourceType: 'Lesson',
            resource: lesson,
        });

        return true;
    }

    public async findById(id: string): Promise<Lesson | null> {
        const lesson = await this.prismaClient.lesson.findUnique({
            where: { id },
        });

        if (!lesson) {
            return null;
        }

        await this.canReadLesson(lesson);
        return lesson;
    }

    public async findByLevel(levelId: string): Promise<Lesson[]> {
        const iamPermission = await this.validateIAM({
            action: 'list',
            resourceType: 'Lesson',
        });

        return this.prismaClient.lesson.findMany({
            where: {
                AND: { ...iamPermission.filter },
                levelId,
            },
            orderBy: { levelOrder: 'asc' },
        });
    }

    public async findFirstLessonByLevel(levelId: string): Promise<Lesson | null> {
        const lesson = await this.prismaClient.lesson.findFirst({
            where: { levelId },
            orderBy: { levelOrder: 'asc' },
        });

        if (!lesson) {
            return null;
        }

        await this.canReadLesson(lesson);
        return lesson;
    }

    public async findLastLessonByLevel(levelId: string): Promise<Lesson | null> {
        const lesson = await this.prismaClient.lesson.findFirst({
            where: { levelId },
            orderBy: { levelOrder: 'desc' },
        });

        if (!lesson) {
            return null;
        }

        await this.canReadLesson(lesson);
        return lesson;
    }

    // find next lesson in level. If last lesson then return null
    public async findNextLesson(lessonId: string): Promise<Lesson | null> {
        const lesson = await this.findById(lessonId);

        if (!lesson) {
            return null;
        }

        const nextLesson = await this.prismaClient.lesson.findFirst({
            where: { levelId: lesson.levelId, levelOrder: { gt: lesson.levelOrder } },
            orderBy: { levelOrder: 'asc' },
        });

        if (!nextLesson) {
            return null;
        }

        this.canReadLesson(nextLesson);
        return nextLesson;
    }
}
