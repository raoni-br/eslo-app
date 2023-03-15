/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EditEventBottomSheetComponent } from './edit-event-bottom-sheet.component';

describe('EditEventBottomSheetComponent', () => {
    let component: EditEventBottomSheetComponent;
    let fixture: ComponentFixture<EditEventBottomSheetComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EditEventBottomSheetComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EditEventBottomSheetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
