import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-groups-list',
    templateUrl: './groups-list.component.html',
    styleUrls: ['./groups-list.component.scss'],
})
export class GroupsListComponent {
    @Input() groups: any[];

    @Output() groupDetailEvent = new EventEmitter<string>();
    @Output() groupEditEvent = new EventEmitter<string>();

    constructor() {}

    onGroupDetail(groupId: string) {
        this.groupDetailEvent.emit(groupId);
    }

    onGroupEdit(groupId: string) {
        this.groupEditEvent.emit(groupId);
    }
}
