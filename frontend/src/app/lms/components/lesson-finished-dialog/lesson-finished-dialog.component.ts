import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectionList } from '@angular/material/list';
import { ClassRecord } from 'app/@core/models/class-record.model';

@Component({
    selector: 'app-lesson-finished-dialog',
    templateUrl: './lesson-finished-dialog.component.html',
    styleUrls: ['./lesson-finished-dialog.component.scss'],
})
export class LessonFinishedDialogComponent implements OnInit {
    eventStart: string;
    eventEnd: string;

    lessonFinished = false;
    minutes: number;

    @ViewChild('attendeesList') attendeesList: MatSelectionList;

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: { classInProgress: ClassRecord },
        private dialogRef: MatDialogRef<LessonFinishedDialogComponent>,
        private datePipe: DatePipe,
    ) {}

    ngOnInit(): void {
        this.eventEnd = this.datePipe.transform(new Date(), 'HH:mm');

        let startedAt: string;
        if (this.classInProgress.sourceType === 'ENROLLMENT') {
            startedAt = this.classInProgress.enrollmentClassRecord.startedAt;
        } else {
            startedAt = this.classInProgress.studyGroupClassRecord.startedAt;
        }

        const eventStartTime = parseInt(startedAt, 10);
        const eventStartDate = new Date(eventStartTime);
        this.eventStart = this.datePipe.transform(eventStartDate, 'HH:mm');

        const now = Date.now();
        this.checkClassLength(now);
    }

    checkClassLength(eventEndTime: number): void {
        const today = new Date();
        const [hour, minutes] = this.eventStart.split(':');
        today.setHours(+hour);
        today.setMinutes(+minutes);
        const eventStartTime = today.getTime();

        const difference = eventEndTime - eventStartTime;
        this.minutes = Math.floor(difference / 1000 / 60);
    }

    updateTimeStart(value: string): void {
        this.eventStart = value;

        if (value) {
            const today = new Date();
            const [hour, minutes] = this.eventEnd.split(':');
            today.setHours(+hour);
            today.setMinutes(+minutes);
            const utc = today.getTime();
            this.checkClassLength(utc);
        }
    }

    updateTimeEnd(value: string): void {
        this.eventEnd = value;

        if (value) {
            const today = new Date();
            const [hour, minutes] = value.split(':');
            today.setHours(+hour);
            today.setMinutes(+minutes);
            const utc = today.getTime();
            this.checkClassLength(utc);
        }
    }

    onConfirm(): void {
        const attendees =
            this.attendeesList?.options?.map((option) => {
                const {
                    selected: attended,
                    value: { studentId },
                } = option;
                return {
                    studentId,
                    attended,
                };
            }) || [];

        const session = {
            eventStart: this.eventStart,
            eventEnd: this.eventEnd,
            lessonFinished: this.lessonFinished,
            attendees,
        };

        this.dialogRef.close({ confirm: true, session });
    }

    get classInProgress(): ClassRecord {
        return this.data?.classInProgress;
    }

    get isGroup(): boolean {
        return this.classInProgress.sourceType === 'STUDY_GROUP';
    }
}
