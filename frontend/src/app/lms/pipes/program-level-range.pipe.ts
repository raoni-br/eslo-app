import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'programLevelRange',
})
export class ProgramLevelRangePipe implements PipeTransform {
    transform(modules: any, args?: any): any {
        const levels = [].concat(...modules.map((module) => module.levels));
        const firstLevel = levels[0].code.split('-').pop();
        const lastLevel = levels[levels.length - 1].code.split('-').pop();

        return `${firstLevel} - ${lastLevel}`;
    }
}
