import { LessonMaterial } from './lesson-material.model';

export interface Lesson {
    id?: string;
    category?: string;
    code?: string;
    lessonMaterial?: LessonMaterial;
    levelOrder?: number;
    slug?: string;
    subject?: string;
    title?: string;
}
