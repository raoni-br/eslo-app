/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SelectPlanPageComponent } from './select-plan-page.component';

describe('SelectPlanPageComponent', () => {
    let component: SelectPlanPageComponent;
    let fixture: ComponentFixture<SelectPlanPageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SelectPlanPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectPlanPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
