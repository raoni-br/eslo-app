/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { StudentBookPageComponent } from './student-book-page.component';

describe('StudentBookPageComponent', () => {
    let component: StudentBookPageComponent;
    let fixture: ComponentFixture<StudentBookPageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StudentBookPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StudentBookPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
