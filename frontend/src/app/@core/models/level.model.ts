import { Lesson } from './lesson.model';
import { Module } from './module.model';

export interface LevelLayoutSettings {
    svgImageUrl?: string;
    icon?: string;
    primaryColour?: string; // hex
    secondaryColour?: string; // hex
}

export interface Level {
    id?: string;
    code?: string;
    description?: string;
    moduleOrder?: number;
    name?: string;
    label?: string;
    layoutSettings?: LevelLayoutSettings;
    lessons?: Lesson[];
    module?: Module;
}
