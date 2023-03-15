/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EsloOrbComponent } from './eslo-orb.component';

describe('EsloOrbComponent', () => {
    let component: EsloOrbComponent;
    let fixture: ComponentFixture<EsloOrbComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EsloOrbComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EsloOrbComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
