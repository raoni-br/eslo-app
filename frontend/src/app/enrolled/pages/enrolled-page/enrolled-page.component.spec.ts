/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EnrolledPageComponent } from './enrolled-page.component';

describe('EnrolledPageComponent', () => {
    let component: EnrolledPageComponent;
    let fixture: ComponentFixture<EnrolledPageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EnrolledPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EnrolledPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
