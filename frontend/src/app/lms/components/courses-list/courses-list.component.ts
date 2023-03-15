import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Program } from 'app/@core/models/program.model';

@Component({
    selector: 'app-courses-list',
    templateUrl: './courses-list.component.html',
    styleUrls: ['./courses-list.component.scss'],
})
export class CoursesListComponent {
    @Input() courses: Program[] | any;

    @Output() courseDetailEvent = new EventEmitter<string>();

    constructor() {}

    onCourseDetail(courseId: string) {
        this.courseDetailEvent.emit(courseId);
    }
}
