import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatChip, MatChipList, MatChipListChange } from '@angular/material/chips';
import { Lesson } from 'app/@core/models/lesson.model';

@Component({
    selector: 'app-lessons-list',
    templateUrl: './lessons-list.component.html',
    styleUrls: ['./lessons-list.component.scss'],
})
export class LessonsListComponent {
    @Input() lessons: any;

    @Output() planLessonEvent = new EventEmitter<string>();
    @Output() goToLessonEvent = new EventEmitter<Lesson>();

    @ViewChild('chipList') chipList: MatChipList;

    selectedFilters: string[];
    filters = [
        {
            value: 'grammar',
            selected: false,
        },
        {
            value: 'listening',
            selected: false,
        },
        {
            value: 'speaking',
            selected: false,
        },
        {
            value: 'reading',
            selected: false,
        },
    ];

    constructor() {}

    onPlanLesson(lessonId: string) {
        this.planLessonEvent.emit(lessonId);
    }

    onSelectChip(filter, chip) {
        if (filter.selected) {
            chip.deselect();
            filter.selected = false;
        } else {
            chip.select();
            filter.selected = true;
        }

        // treatment when clicking on chip
        // I think there are two different events when chip is selected, backspace and custom 'click'
        // chips don't have click event by default
        const array = Array.from(this.chipList.selected as MatChip[]).map((chip) => chip.value);
        this.selectedFilters = array;
    }

    onChangeSelected(event, filter): void {
        filter.selected = event.selected;
    }

    onChangeList({ value }: MatChipListChange) {
        this.selectedFilters = value;
    }

    onSelectFilter(index: number) {
        this.filters = this.filters.map((filter, i) => {
            if (index === i) {
                return {
                    ...filter,
                    selected: !filter.selected,
                };
            }

            return filter;
        });
    }

    goToClass(lesson: Lesson): void {
        this.goToLessonEvent.emit(lesson);
    }
}
