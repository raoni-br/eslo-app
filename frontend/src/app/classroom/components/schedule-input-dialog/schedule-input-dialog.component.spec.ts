/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ScheduleInputDialogComponent } from './schedule-input-dialog.component';

describe('ScheduleInputDialogComponent', () => {
    let component: ScheduleInputDialogComponent;
    let fixture: ComponentFixture<ScheduleInputDialogComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ScheduleInputDialogComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ScheduleInputDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
