/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { GroupMembersPageComponent } from './group-members-page.component';

describe('GroupMembersPageComponent', () => {
    let component: GroupMembersPageComponent;
    let fixture: ComponentFixture<GroupMembersPageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [GroupMembersPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GroupMembersPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
