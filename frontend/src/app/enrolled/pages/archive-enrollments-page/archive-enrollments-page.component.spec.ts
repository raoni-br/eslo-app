/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ArchiveEnrollmentsPageComponent } from './archive-enrollments-page.component';

describe('ArchiveEnrollmentsPageComponent', () => {
    let component: ArchiveEnrollmentsPageComponent;
    let fixture: ComponentFixture<ArchiveEnrollmentsPageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ArchiveEnrollmentsPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ArchiveEnrollmentsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
