/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CreateInvitationPageComponent } from './create-invitation-page.component';

describe('CreateInvitationPageComponent', () => {
    let component: CreateInvitationPageComponent;
    let fixture: ComponentFixture<CreateInvitationPageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CreateInvitationPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateInvitationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
