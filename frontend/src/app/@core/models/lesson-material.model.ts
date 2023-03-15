import { Media } from './media.model';

export interface MediaAssociation {
    media?: Media;
    order?: number;
}

export interface Activity {
    activitySlides?: MediaAssociation[];
    order?: number;
    title?: string;
}

export interface LessonMaterial {
    activities?: Activity[];
    audio?: MediaAssociation[];
    lectureScript?: MediaAssociation[];
    studentBook?: MediaAssociation[];
}
