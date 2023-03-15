import { Component, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { Output } from '@angular/core';
import { Input } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';

@Component({
    selector: 'app-filters-list',
    templateUrl: './filters-list.component.html',
    styleUrls: ['./filters-list.component.scss'],
})
export class FiltersListComponent implements OnChanges {
    @Input() options: any[];
    @Input() value: string;

    selectedOption: any;

    @Output() selectChangeEvent = new EventEmitter();

    constructor() {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['options']) {
            const { currentValue } = changes['options'];

            if (currentValue.length) {
                this.selectedOption = this.options[0];
            }
        }

        if (changes['value']) {
            const { currentValue } = changes['value'];

            if (currentValue) {
                this.selectedOption = this.options.find((option) => option.value === currentValue);
            }
        }
    }

    onSelectionChange({ value }: MatSelectChange) {
        this.selectChangeEvent.emit(value.value);
    }
}
