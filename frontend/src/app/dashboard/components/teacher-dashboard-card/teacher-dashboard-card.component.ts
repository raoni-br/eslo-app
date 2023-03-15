import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ITeacherCardContent } from 'app/dashboard/pages/dashboard-page/dashboard-page.component';

@Component({
    selector: 'app-teacher-dashboard-card',
    templateUrl: './teacher-dashboard-card.component.html',
    styleUrls: ['./teacher-dashboard-card.component.scss'],
})
export class TeacherDashboardCardComponent {
    @Input() icon = 'pending_actions';
    @Input() title = 'schedule';
    @Input() emptyMessage = 'Empty content';

    @Input() contentList: ITeacherCardContent[];

    @Output() goToEvent = new EventEmitter<any>();

    constructor() {}

    goTo(content: any) {
        this.goToEvent.emit(content);
    }
}
