/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EnrollmentDetailPageComponent } from './enrollment-detail-page.component';

describe('EnrollmentDetailPageComponent', () => {
    let component: EnrollmentDetailPageComponent;
    let fixture: ComponentFixture<EnrollmentDetailPageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EnrollmentDetailPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EnrollmentDetailPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
