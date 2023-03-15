/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CustomStepperComponent } from './custom-stepper.component';

describe('CustomStepperComponent', () => {
    let component: CustomStepperComponent;
    let fixture: ComponentFixture<CustomStepperComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CustomStepperComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CustomStepperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
