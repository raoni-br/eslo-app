import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewEntityComponent } from './review-entity.component';

describe('ReviewEntityComponent', () => {
    let component: ReviewEntityComponent;
    let fixture: ComponentFixture<ReviewEntityComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ReviewEntityComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ReviewEntityComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
