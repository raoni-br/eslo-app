/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { OnboardingStepperComponent } from './onboarding-stepper.component';

describe('OnboardingStepperComponent', () => {
    let component: OnboardingStepperComponent;
    let fixture: ComponentFixture<OnboardingStepperComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [OnboardingStepperComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OnboardingStepperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
