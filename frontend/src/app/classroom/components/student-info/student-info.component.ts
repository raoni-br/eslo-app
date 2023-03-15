import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'app-student-info',
    templateUrl: './student-info.component.html',
    styleUrls: ['./student-info.component.scss'],
})
export class StudentInfoComponent {
    @Input() studentInfoForm: FormGroup;
    @Input() disableControlValue: boolean;

    constructor() {}
}
