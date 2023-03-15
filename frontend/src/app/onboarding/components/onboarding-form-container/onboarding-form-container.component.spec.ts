/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { OnboardingFormContainerComponent } from './onboarding-form-container.component';

describe('OnboardingFormContainerComponent', () => {
    let component: OnboardingFormContainerComponent;
    let fixture: ComponentFixture<OnboardingFormContainerComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [OnboardingFormContainerComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OnboardingFormContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
