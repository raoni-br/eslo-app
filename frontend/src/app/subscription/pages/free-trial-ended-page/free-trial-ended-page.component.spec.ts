/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FreeTrialEndedPageComponent } from './free-trial-ended-page.component';

describe('FreeTrialEndedPageComponent', () => {
    let component: FreeTrialEndedPageComponent;
    let fixture: ComponentFixture<FreeTrialEndedPageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FreeTrialEndedPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FreeTrialEndedPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
