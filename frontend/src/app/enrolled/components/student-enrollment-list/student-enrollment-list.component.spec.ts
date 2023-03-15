/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { StudentEnrollmentListComponent } from './student-enrollment-list.component';

describe('StudentEnrollmentListComponent', () => {
    let component: StudentEnrollmentListComponent;
    let fixture: ComponentFixture<StudentEnrollmentListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StudentEnrollmentListComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StudentEnrollmentListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
