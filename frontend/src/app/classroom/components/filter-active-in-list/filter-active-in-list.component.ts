import { Component, EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { Input } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
    selector: 'app-filter-active-in-list',
    templateUrl: './filter-active-in-list.component.html',
    styleUrls: ['./filter-active-in-list.component.scss'],
})
export class FilterActiveInListComponent {
    @Input() checked: boolean;
    @Input() label: string;

    selectedOption: boolean;

    @Output() selectChangeEvent = new EventEmitter();

    constructor() {}

    onSelectionChange(checkbox: MatCheckboxChange) {
        this.selectChangeEvent.emit(checkbox.checked);
    }
}
