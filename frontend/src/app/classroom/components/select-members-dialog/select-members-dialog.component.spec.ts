/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SelectMembersDialogComponent } from './select-members-dialog.component';

describe('SelectMembersDialogComponent', () => {
    let component: SelectMembersDialogComponent;
    let fixture: ComponentFixture<SelectMembersDialogComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SelectMembersDialogComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectMembersDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
