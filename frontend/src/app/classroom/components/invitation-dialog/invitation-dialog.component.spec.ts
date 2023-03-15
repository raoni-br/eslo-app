/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { InvitationDialogComponent } from './invitation-dialog.component';

describe('InvitationDialogComponent', () => {
    let component: InvitationDialogComponent;
    let fixture: ComponentFixture<InvitationDialogComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [InvitationDialogComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InvitationDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
