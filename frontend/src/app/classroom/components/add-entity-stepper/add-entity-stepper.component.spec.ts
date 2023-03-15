import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEntityStepperComponent } from './add-entity-stepper.component';

describe('AddEntityStepperComponent', () => {
    let component: AddEntityStepperComponent;
    let fixture: ComponentFixture<AddEntityStepperComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AddEntityStepperComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AddEntityStepperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
