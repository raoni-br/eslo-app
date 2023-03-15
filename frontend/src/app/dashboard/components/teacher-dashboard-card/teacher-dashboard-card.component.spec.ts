/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TeacherDashboardCardComponent } from './teacher-dashboard-card.component';

describe('TeacherDashboardCardComponent', () => {
    let component: TeacherDashboardCardComponent;
    let fixture: ComponentFixture<TeacherDashboardCardComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TeacherDashboardCardComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TeacherDashboardCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
