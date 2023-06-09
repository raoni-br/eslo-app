/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CoursesPageComponent } from './courses-page.component';

describe('CoursesPageComponent', () => {
    let component: CoursesPageComponent;
    let fixture: ComponentFixture<CoursesPageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CoursesPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CoursesPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
