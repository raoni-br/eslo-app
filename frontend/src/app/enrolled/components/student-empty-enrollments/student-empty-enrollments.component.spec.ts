/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { StudentEmptyEnrollmentsComponent } from './student-empty-enrollments.component';

describe('StudentEmptyEnrollmentsComponent', () => {
    let component: StudentEmptyEnrollmentsComponent;
    let fixture: ComponentFixture<StudentEmptyEnrollmentsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StudentEmptyEnrollmentsComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StudentEmptyEnrollmentsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
