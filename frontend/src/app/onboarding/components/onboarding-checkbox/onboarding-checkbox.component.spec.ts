/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { OnboardingCheckboxComponent } from './onboarding-checkbox.component';

describe('OnboardingCheckboxComponent', () => {
    let component: OnboardingCheckboxComponent;
    let fixture: ComponentFixture<OnboardingCheckboxComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [OnboardingCheckboxComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OnboardingCheckboxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
