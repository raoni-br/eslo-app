/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { GroupSchedulePageComponent } from './group-schedule-page.component';

describe('GroupSchedulePageComponent', () => {
    let component: GroupSchedulePageComponent;
    let fixture: ComponentFixture<GroupSchedulePageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [GroupSchedulePageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GroupSchedulePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
