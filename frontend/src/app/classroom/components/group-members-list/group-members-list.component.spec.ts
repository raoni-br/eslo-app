/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { GroupMembersListComponent } from './group-members-list.component';

describe('GroupMembersListComponent', () => {
    let component: GroupMembersListComponent;
    let fixture: ComponentFixture<GroupMembersListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [GroupMembersListComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GroupMembersListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
