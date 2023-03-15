/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SubscriptionActivePageComponent } from './subscription-active-page.component';

describe('SubscriptionActivePageComponent', () => {
    let component: SubscriptionActivePageComponent;
    let fixture: ComponentFixture<SubscriptionActivePageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SubscriptionActivePageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SubscriptionActivePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
