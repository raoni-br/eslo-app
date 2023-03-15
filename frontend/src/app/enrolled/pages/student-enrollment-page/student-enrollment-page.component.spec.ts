/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { StudentEnrollmentPageComponent } from './student-enrollment-page.component';

describe('StudentEnrollmentPageComponent', () => {
    let component: StudentEnrollmentPageComponent;
    let fixture: ComponentFixture<StudentEnrollmentPageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StudentEnrollmentPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StudentEnrollmentPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
