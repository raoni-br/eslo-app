import { Module } from './module.model';

export interface Program {
    id?: string;
    code?: string;
    modules?: Module[];
    name?: string;
    icon?: string;
    label?: string;
}
