import { CalendarEvent } from 'angular-calendar';
import { Component, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { WeeklyAvailabilityComponent } from 'app/@shared/components/calendar/weekly-availability/weekly-availability.component';

@Component({
    selector: 'app-edit-event-bottom-sheet',
    templateUrl: './edit-event-bottom-sheet.component.html',
    styleUrls: ['./edit-event-bottom-sheet.component.scss'],
})
export class EditEventBottomSheetComponent {
    today: Date;

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private data: { event: CalendarEvent },
        private bottomSheetRef: MatBottomSheetRef<EditEventBottomSheetComponent>,
        private dialog: MatDialog,
    ) {}

    onClose(refresh?: boolean): void {
        this.bottomSheetRef.dismiss(refresh);
    }

    onWeeklyAvailability() {
        this.dialog.open(WeeklyAvailabilityComponent, {
            panelClass: 'dialog-w-100',
            position: {
                left: '10px',
            },
        });
    }

    onToday() {
        this.today = new Date();
    }

    get event() {
        return this.data?.event;
    }
}
