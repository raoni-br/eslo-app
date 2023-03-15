/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LessonClassPageComponent } from './lesson-class-page.component';

describe('LessonClassPageComponent', () => {
    let component: LessonClassPageComponent;
    let fixture: ComponentFixture<LessonClassPageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [LessonClassPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LessonClassPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
