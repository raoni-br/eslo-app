/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ActiveEnrollmentsPageComponent } from './active-enrollments-page.component';

describe('ActiveEnrollmentsPageComponent', () => {
    let component: ActiveEnrollmentsPageComponent;
    let fixture: ComponentFixture<ActiveEnrollmentsPageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ActiveEnrollmentsPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ActiveEnrollmentsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
