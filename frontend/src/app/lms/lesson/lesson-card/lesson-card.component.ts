import { Component, Input } from '@angular/core';

import { Lesson } from 'app/@core/models/lesson.model';

@Component({
    selector: 'app-lesson-card',
    templateUrl: './lesson-card.component.html',
    styleUrls: ['./lesson-card.component.scss'],
})
export class LessonCardComponent {
    @Input() lesson: Lesson;

    constructor() {}
}
