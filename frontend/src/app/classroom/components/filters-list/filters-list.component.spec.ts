/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FiltersListComponent } from './filters-list.component';

describe('FiltersListComponent', () => {
    let component: FiltersListComponent;
    let fixture: ComponentFixture<FiltersListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FiltersListComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FiltersListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
