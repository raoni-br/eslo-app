import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-student-empty-enrollments',
    templateUrl: './student-empty-enrollments.component.html',
    styleUrls: ['./student-empty-enrollments.component.scss'],
})
export class StudentEmptyEnrollmentsComponent {
    @Input() text = 'Nothing to show here.';

    constructor() {}
}
