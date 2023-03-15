/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SlidesStepperComponent } from './slides-stepper.component';

describe('SlidesStepperComponent', () => {
    let component: SlidesStepperComponent;
    let fixture: ComponentFixture<SlidesStepperComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SlidesStepperComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SlidesStepperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
