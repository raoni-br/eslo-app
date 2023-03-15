/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { GroupAttendeesComponent } from './group-attendees.component';

describe('GroupAttendeesComponent', () => {
    let component: GroupAttendeesComponent;
    let fixture: ComponentFixture<GroupAttendeesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [GroupAttendeesComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GroupAttendeesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
