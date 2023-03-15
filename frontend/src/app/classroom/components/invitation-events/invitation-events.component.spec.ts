/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { InvitationEventsComponent } from './invitation-events.component';

describe('InvitationEventsComponent', () => {
    let component: InvitationEventsComponent;
    let fixture: ComponentFixture<InvitationEventsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [InvitationEventsComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InvitationEventsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
