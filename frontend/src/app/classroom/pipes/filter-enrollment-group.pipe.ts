import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterEnrollmentGroup',
})
export class FilterEnrollmentGroupPipe implements PipeTransform {
    transform(groups: any, ...args: any): any {
        const [program, level] = args;

        if (!program && !level) {
            return groups;
        }

        let programCode: string;
        let levelCompleteCode: string;
        if (program) {
            programCode = program.code;
        }

        if (level) {
            levelCompleteCode = level.code;
        }

        const [levelModule, levelType, levelCode] = levelCompleteCode?.split('-') || [];

        const filteredGroups = groups.filter((group) => {
            const [module, type, level] = group.level.code.split('-');

            const showGroup = levelCode ? module === programCode && level === levelCode : module === programCode;

            return showGroup;
        });

        return filteredGroups;
    }
}
