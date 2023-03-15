/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { GroupEmptyMembersComponent } from './group-empty-members.component';

describe('GroupEmptyMembersComponent', () => {
    let component: GroupEmptyMembersComponent;
    let fixture: ComponentFixture<GroupEmptyMembersComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [GroupEmptyMembersComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GroupEmptyMembersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
