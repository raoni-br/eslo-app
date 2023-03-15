/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SelectGroupEnrollmentComponent } from './select-group-enrollment.component';

describe('SelectGroupEnrollmentComponent', () => {
    let component: SelectGroupEnrollmentComponent;
    let fixture: ComponentFixture<SelectGroupEnrollmentComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SelectGroupEnrollmentComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectGroupEnrollmentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
