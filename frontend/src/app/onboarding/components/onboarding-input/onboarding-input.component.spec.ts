/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { OnboardingInputComponent } from './onboarding-input.component';

describe('OnboardingInputComponent', () => {
    let component: OnboardingInputComponent;
    let fixture: ComponentFixture<OnboardingInputComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [OnboardingInputComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OnboardingInputComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
