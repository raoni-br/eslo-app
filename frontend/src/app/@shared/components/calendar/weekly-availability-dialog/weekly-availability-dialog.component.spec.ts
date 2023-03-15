import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyAvailabilityDialogComponent } from './weekly-availability-dialog.component';

describe('WeeklyAvailabilityDialogComponent', () => {
    let component: WeeklyAvailabilityDialogComponent;
    let fixture: ComponentFixture<WeeklyAvailabilityDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [WeeklyAvailabilityDialogComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WeeklyAvailabilityDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
