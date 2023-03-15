import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'app-review-entity',
    templateUrl: './review-entity.component.html',
    styleUrls: ['./review-entity.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewEntityComponent {
    @Input() studentForm: FormGroup;

    @Input() groupForm: FormGroup;

    @Input() courseForm: FormGroup;

    @Input() eventsForm: FormGroup;

    @Input() entity: string;

    constructor() {}
}
