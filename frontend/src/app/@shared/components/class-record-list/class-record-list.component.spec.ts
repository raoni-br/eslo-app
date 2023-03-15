/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ClassRecordListComponent } from './class-record-list.component';

describe('ClassRecordListComponent', () => {
    let component: ClassRecordListComponent;
    let fixture: ComponentFixture<ClassRecordListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ClassRecordListComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ClassRecordListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
