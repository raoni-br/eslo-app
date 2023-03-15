import { NgControl } from '@angular/forms';
import { Directive, Input, OnChanges } from '@angular/core';

@Directive({
    selector: '[disableControl]',
})
export class DisableControlDirective implements OnChanges {
    @Input() disableControl;

    ngOnChanges(changes): void {
        if (changes['disableControl']) {
            const action = this.disableControl ? 'disable' : 'enable';
            this.ngControl.control[action]();
        }
    }

    constructor(private ngControl: NgControl) {}
}
