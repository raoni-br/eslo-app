import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-group-empty-members',
    templateUrl: './group-empty-members.component.html',
    styleUrls: ['./group-empty-members.component.scss'],
})
export class GroupEmptyMembersComponent {
    @Output() addNewMemberEvent = new EventEmitter<any>();
    @Output() addExistingMembersEvent = new EventEmitter<any>();
    @Output() removeGroupEvent = new EventEmitter<any>();

    constructor() {}

    addNewMember() {
        this.addNewMemberEvent.emit();
    }

    addExistingMembers() {
        this.addExistingMembersEvent.emit();
    }

    removeGroup() {
        this.removeGroupEvent.emit();
    }
}
