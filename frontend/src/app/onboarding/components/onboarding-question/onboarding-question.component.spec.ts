/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { OnboardingQuestionComponent } from './onboarding-question.component';

describe('OnboardingQuestionComponent', () => {
    let component: OnboardingQuestionComponent;
    let fixture: ComponentFixture<OnboardingQuestionComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [OnboardingQuestionComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OnboardingQuestionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
