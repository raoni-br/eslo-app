/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LesloComponent } from './leslo.component';

describe('LesloComponent', () => {
    let component: LesloComponent;
    let fixture: ComponentFixture<LesloComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LesloComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LesloComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
