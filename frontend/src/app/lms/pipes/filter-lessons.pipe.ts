import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterLessons',
})
export class FilterLessonsPipe implements PipeTransform {
    transform(value: any, ...args: any[]): any {
        const lessons = value;
        const [selectedFilters] = args;

        if (!selectedFilters || selectedFilters.length === 0) {
            return lessons;
        }

        const filteredLessons = lessons.filter((lesson) => selectedFilters.includes(lesson.category.toLowerCase()));

        return filteredLessons;
    }
}
