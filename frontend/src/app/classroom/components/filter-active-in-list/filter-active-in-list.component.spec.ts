import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterActiveInListComponent } from './filter-active-in-list.component';

describe('FilterActiveInListComponent', () => {
    let component: FilterActiveInListComponent;
    let fixture: ComponentFixture<FilterActiveInListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FilterActiveInListComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FilterActiveInListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
