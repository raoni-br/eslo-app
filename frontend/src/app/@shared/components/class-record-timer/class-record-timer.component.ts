import { CdkDragRelease } from '@angular/cdk/drag-drop';
import {
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { ClassRecord } from 'app/@core/models/class-record.model';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-class-record-timer',
    templateUrl: './class-record-timer.component.html',
    styleUrls: ['./class-record-timer.component.scss'],
})
export class ClassRecordTimerComponent implements OnInit, OnDestroy {
    @Output() doneEvent = new EventEmitter();
    @Output() bookmarkEvent = new EventEmitter();

    @Input() classInProgress: ClassRecord;

    @ViewChild('cardElement', { static: true }) cardElement: ElementRef;

    isLessonOvertime: boolean;
    classDuration: string;

    private destroy$ = new Subject<void>();

    constructor(@Inject(Window) private window: Window) {}

    ngOnInit() {
        this.initTimer();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    initTimer() {
        timer(0, 1000)
            .pipe(takeUntil(this.destroy$))
            .subscribe((val) => {
                if (!this.classInProgress) {
                    return;
                }

                let dateDiff: number;
                try {
                    let startedAt: string;
                    if (this.classInProgress.sourceType === 'ENROLLMENT') {
                        startedAt = this.classInProgress.enrollmentClassRecord.startedAt;
                    } else {
                        startedAt = this.classInProgress.studyGroupClassRecord.startedAt;
                    }

                    dateDiff = new Date().getTime() - parseInt(startedAt, 10);
                } finally {
                    if (!dateDiff || dateDiff < 0) {
                        dateDiff = val * 1000;
                    }

                    const lessonDuration = 60 * 60 * 1000; // (1 hour)
                    this.isLessonOvertime = dateDiff > lessonDuration;
                    this.classDuration = new Date(dateDiff).toISOString().substr(11, 8);
                }
            });
    }

    onDone() {
        this.doneEvent.emit();
    }

    onDragReleased(evt: CdkDragRelease) {
        const rect = this.cardElement.nativeElement.getBoundingClientRect();
        localStorage.setItem('classInProgressPosition', JSON.stringify(rect));
    }

    onOpenScriptStandAlone(lessonId: string) {
        const url = `script/${lessonId}`;
        this.window.open(url, '_blank');
    }

    get isGroup(): boolean {
        return this.classInProgress.sourceType === 'STUDY_GROUP';
    }

    get lessonId() {
        return this.isGroup
            ? this.classInProgress.studyGroupClassRecord.lesson.id
            : this.classInProgress.enrollmentClassRecord.lesson.id;
    }
}
