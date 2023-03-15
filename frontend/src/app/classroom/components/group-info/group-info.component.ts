import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-group-info',
    templateUrl: './group-info.component.html',
    styleUrls: ['./group-info.component.scss'],
})
export class GroupInfoComponent {
    @Input() groupNameControl: FormControl;
    @Input() groupProgramControl: FormControl;
    @Input() groupLevelControl: FormControl;

    constructor() {}
}
