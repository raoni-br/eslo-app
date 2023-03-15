import { Level } from './level.model';
import { Program } from './program.model';

export interface Module {
    id?: string;
    code?: string;
    description?: string;
    name?: string;
    programOrder?: number;
    levels?: Level[];
    program?: Program;
}
