/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EnrollmentCardComponent } from './enrollment-card.component';

describe('EnrollmentCardComponent', () => {
    let component: EnrollmentCardComponent;
    let fixture: ComponentFixture<EnrollmentCardComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EnrollmentCardComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EnrollmentCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
