import { Component, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Enrollment, StudyGroup } from 'app/@core/models/enrollment.model';
import { Event } from 'app/@core/models/event.model';
import { ClassroomService } from 'app/@core/services/classroom.service';
import {
    EventHasNoDaySelectedValidator,
    EventHasScheduleConflictValidator,
    EventHasStartAndEndTimeConflictValidator,
    EventsWithSameDateValidator,
} from 'app/@shared/components/calendar/schedule-input/validators';
import {
    ModalConfirmationComponent,
    ModalConfirmationDataOptions,
} from 'app/@shared/components/modal-confirmation/modal-confirmation.component';
import { combineLatest, EMPTY, of, Subject } from 'rxjs';
import { debounceTime, map, skip, startWith, switchMap, take, takeUntil } from 'rxjs/operators';

export interface ITab {
    title?: string;
    active?: boolean;
    icon?: string;
    completed?: boolean;
}

@Component({
    selector: 'app-invitation-dialog',
    templateUrl: './invitation-dialog.component.html',
    styleUrls: ['./invitation-dialog.component.scss'],
})
export class InvitationDialogComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    private resetEventsFormTimeout: ReturnType<typeof setTimeout>;

    studentForm = new FormGroup({
        studentInfo: new FormGroup({
            firstName: new FormControl('', [Validators.required]),
            lastName: new FormControl('', [Validators.required]),
            email: new FormControl('', [Validators.required, Validators.email]),
        }),
        // sourceType: new FormControl('', [Validators.required]),
        selectedGroup: new FormControl(''),
    });

    groupForm = new FormGroup({
        name: new FormControl('', [Validators.required]),
    });

    courseForm = new FormGroup({
        sourceType: new FormControl('', [Validators.required]),
        program: new FormControl('', [Validators.required]),
        level: new FormControl('', [Validators.required]),
    });

    eventsForm = new FormGroup({
        events: new FormArray([], [Validators.required], [EventsWithSameDateValidator.validate()]),
    });

    formProgress = 0;
    studentInfoTabCompleted = false;
    courseTabCompleted = false;
    scheduleTabCompleted = false;

    groups$ = of([]);

    @HostListener('document:keydown.escape', ['$event'])
    handleKeyDown(event: KeyboardEvent) {
        this.dialogRef.close();
    }

    constructor(
        private mediaObserver: MediaObserver,
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<InvitationDialogComponent>,
        private formBuilder: FormBuilder,
        private classroomService: ClassroomService,
        @Inject(MAT_DIALOG_DATA)
        public data: {
            tabs: ITab[];
            enrollment: Enrollment;
            type: string;
            group: StudyGroup;
            selectedGroup: StudyGroup;
        },
    ) {}

    ngOnInit() {
        this.tabs[0].active = true;

        if (this.type === 'student') {
            this.checkEditingEnrollment();
            this.listenSourceTypeChange();

            if (!this.editingEnrollment) {
                this.checkSelectedGroup();
                this.calculateFormProgress();
                this.addEvent();
            }
        }

        if (this.type === 'group') {
            this.checkEditingGroup();
            this.sourceTypeControl.setValidators([]);
            this.sourceTypeControl.updateValueAndValidity();

            if (!this.editingGroup) {
                this.calculateFormProgress();
                this.addEvent();
            }
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();

        if (this.resetEventsFormTimeout) {
            clearTimeout(this.resetEventsFormTimeout);
        }
    }

    listenSourceTypeChange() {
        this.sourceTypeControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe({
            next: (sourceType) => {
                if (sourceType === 'group') {
                    this.groups$ = this.classroomService
                        .getGroupsQuery()
                        .valueChanges.pipe(map((result: any) => result.data.classroom.studyGroups));

                    this.programControl.setValidators([]);
                    this.programControl.updateValueAndValidity();
                    this.levelControl.setValidators([]);
                    this.levelControl.updateValueAndValidity();
                    this.selectedGroupControl.setValidators([Validators.required]);
                    this.selectedGroupControl.updateValueAndValidity();

                    this.resetEventsFormTimeout = setTimeout(() => {
                        this.events.setValidators([]);
                        this.events.setAsyncValidators([]);
                        this.events.clear();
                        this.events.updateValueAndValidity();
                    }, 0);
                }

                if (sourceType === 'oneOnOne') {
                    this.programControl.setValidators([Validators.required]);
                    this.programControl.updateValueAndValidity();
                    this.levelControl.setValidators([Validators.required]);
                    this.levelControl.updateValueAndValidity();
                    this.events.setValidators([Validators.required]);
                    this.events.setAsyncValidators([EventsWithSameDateValidator.validate()]);
                    this.events.updateValueAndValidity();
                    this.selectedGroupControl.setValidators([]);
                    this.selectedGroupControl.reset();
                    this.selectedGroupControl.updateValueAndValidity();

                    if (!this.editingEnrollment && !this.events.length) {
                        this.addEvent();
                    }
                }
            },
        });
    }

    checkEditingEnrollment() {
        if (!this.editingEnrollment) {
            return;
        }

        const {
            student: { familyName: lastName, firstName, primaryEmail: email },
            level,
            sourceType,
            studyGroup,
            events,
        } = this.editingEnrollment;

        this.studentInfoForm.patchValue({
            firstName,
            lastName,
            email,
        });

        this.courseForm.get('level').patchValue(level);
        // this.studentForm.get('termsAndConditions').patchValue(true);

        const hasGroup = sourceType === 'STUDY_GROUP';
        const sourceTypeValue = hasGroup ? 'group' : 'oneOnOne';
        this.sourceTypeControl.patchValue(sourceTypeValue);

        if (hasGroup) {
            this.selectedGroupControl.patchValue(studyGroup);
        }

        events.forEach((event) => {
            const formEvent: Event = {
                ...event,
            };
            this.events.push(
                this.formBuilder.control(
                    formEvent,
                    [],
                    [
                        EventHasScheduleConflictValidator.validate(),
                        EventHasNoDaySelectedValidator.validate(),
                        EventHasStartAndEndTimeConflictValidator.validate(),
                    ],
                ),
            );
        });
    }

    checkEditingGroup() {
        if (!this.editingGroup) {
            return;
        }

        const { name, level, events } = this.editingGroup;

        this.groupForm.patchValue({
            name,
        });

        this.courseForm.get('level').patchValue(level);

        events.forEach((event) => {
            const formEvent: Event = {
                ...event,
            };
            this.events.push(
                this.formBuilder.control(
                    formEvent,
                    [],
                    [
                        EventHasScheduleConflictValidator.validate(),
                        EventHasNoDaySelectedValidator.validate(),
                        EventHasStartAndEndTimeConflictValidator.validate(),
                    ],
                ),
            );
        });
    }

    checkSelectedGroup() {
        if (!this.selectedGroup) {
            return;
        }

        this.sourceTypeControl.patchValue('group');
        this.selectedGroupControl.patchValue(this.selectedGroup);
    }

    calculateFormProgress() {
        combineLatest([
            this.studentForm.valueChanges.pipe(startWith(this.studentForm.value)),
            this.groupForm.valueChanges.pipe(startWith(this.studentForm.value)),
            this.courseForm.valueChanges.pipe(startWith(this.courseForm.value)),
            this.eventsForm.valueChanges.pipe(startWith(this.eventsForm.value)),
        ])
            .pipe(takeUntil(this.destroy$), debounceTime(350))
            .subscribe({
                next: ([studentForm, groupForm, courseForm, eventsForm]) => {
                    const { selectedGroup } = studentForm;
                    const { sourceType, program, level } = courseForm;
                    const { events } = eventsForm;

                    if (this.type === 'group') {
                        if (this.editingGroup ? true : this.groupForm.valid) {
                            this.tabs[0].completed = true;
                        } else {
                            this.tabs[0].completed = false;
                        }

                        if (program && level) {
                            this.tabs[1].completed = true;
                        } else {
                            this.tabs[1].completed = false;
                        }

                        if (this.events.valid) {
                            this.tabs[2].completed = true;
                        } else {
                            this.tabs[2].completed = false;
                        }
                    } else {
                        if (this.editingEnrollment ? true : this.studentInfoForm.valid) {
                            this.tabs[0].completed = true;
                        } else {
                            this.tabs[0].completed = false;
                        }

                        if (
                            (sourceType === 'group' && selectedGroup) ||
                            (sourceType === 'oneOnOne' && program && level)
                        ) {
                            this.tabs[1].completed = true;
                        } else {
                            this.tabs[1].completed = false;
                        }

                        if (
                            (sourceType === 'group' && selectedGroup) ||
                            (sourceType === 'oneOnOne' && this.events.valid)
                        ) {
                            this.tabs[2].completed = true;
                        } else {
                            this.tabs[2].completed = false;
                        }
                    }

                    const completedTabsLength = [
                        this.tabs[0].completed,
                        this.tabs[1].completed,
                        this.tabs[2].completed,
                    ].filter((tab) => tab).length;

                    if (completedTabsLength === 0) {
                        this.formProgress = 0;
                        return;
                    }

                    if (completedTabsLength === 1) {
                        this.formProgress = 33;
                        return;
                    }
                    if (completedTabsLength === 2) {
                        this.formProgress = 66;
                        return;
                    }
                    if (completedTabsLength === 3) {
                        this.formProgress = 100;
                        return;
                    }
                },
            });
    }

    // Push a new event to the Form Array
    addEvent(): void {
        const todayStartDate = new Date();
        todayStartDate.setHours(18, 0);
        const todayEndDate = new Date();
        todayEndDate.setHours(19, 0);

        const startDateTime = todayStartDate.getTime().toString();
        const endDateTime = todayEndDate.getTime().toString();

        const newEvent: Event = {
            changeStatus: 'NEW',
            currentDays: [],
            startDateTime,
            hasConflict: false,
            endDateTime,
            recurrence: 'RRULE:FREQ=WEEKLY;INTERVAL=1',
        };
        this.events.push(
            this.formBuilder.control(
                newEvent,
                [],
                [
                    EventHasScheduleConflictValidator.validate(),
                    EventHasNoDaySelectedValidator.validate(),
                    EventHasStartAndEndTimeConflictValidator.validate(),
                ],
            ),
        );
    }

    updateEvent({ event, controlIndex }: { event: Event; controlIndex: number }): void {
        // see if event has an id to only set the change status to edited
        const currentEvent = this.events.at(controlIndex);
        if (currentEvent.value.id) {
            this.events.at(controlIndex).setValue({ ...event, changeStatus: 'EDITED' });
            return;
        }

        this.events.at(controlIndex).setValue(event);
    }

    // Remove event from FormArray
    removeEvent(eventIndex: number): void {
        // see if event has an id to only set the change status to deleted
        const currentEvent = this.events.at(eventIndex);
        if (currentEvent.value.id) {
            this.events.at(eventIndex).patchValue({
                ...currentEvent.value,
                changeStatus: 'DELETED',
            });
            return;
        }

        this.events.removeAt(eventIndex);
    }

    selectTab(tab: any) {
        // deactivate all tabs
        this.tabs.forEach((tab) => (tab.active = false));

        // activate the tab the user has clicked on.
        tab.active = true;
    }

    backStep() {
        if (this.selectedTab.title === this.tabs[1].title) {
            this.selectTab(this.tabs[0]);
        } else if (this.selectedTab.title === this.tabs[2].title) {
            this.selectTab(this.tabs[1]);
        }
    }

    nextStep() {
        if (this.selectedTab.title === this.tabs[0].title) {
            this.selectTab(this.tabs[1]);
        } else if (this.selectedTab.title === this.tabs[1].title) {
            this.selectTab(this.tabs[2]);
        }
    }

    // SAVE METHODS
    onSave() {
        if (this.type === 'group') {
            if (this.editingGroup) {
                this.onUpdateGroup();
                return;
            }

            // create group
            const formValues = {
                groupForm: this.groupForm.value,
                courseForm: this.courseForm.value,
                eventsForm: this.eventsForm.value,
            };

            this.dialogRef.close(formValues);
            return;
        }

        if (this.type === 'student') {
            if (this.editingEnrollment) {
                if (
                    this.editingEnrollment.sourceType === 'STUDY_GROUP' &&
                    this.sourceTypeControl.value === 'oneOnOne'
                ) {
                    this.onTransferEnrollment();
                    return;
                }

                this.onChangeSchedule();
                return;
            }

            // create student invitation
            const formValues = {
                studentForm: this.studentForm.value,
                courseForm: this.courseForm.value,
                eventsForm: this.eventsForm.value,
            };

            this.dialogRef.close(formValues);
        }
    }

    onChangeSchedule(): void {
        const {
            studentInfo: { firstName },
        } = this.studentForm.getRawValue();

        const { level } = this.courseForm.getRawValue();
        const { events: unparsedEvents } = this.eventsForm.getRawValue();

        let browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (!browserTimeZone) {
            // default to SP if not found
            browserTimeZone = 'America/Sao_Paulo';
        }

        const enrollmentId = this.editingEnrollment.id;

        const events = unparsedEvents
            .map((event) => {
                const parsedEvent: Event = {
                    title: `${firstName} (1 on 1)`,
                    description: level.name,
                    startTimeZone: browserTimeZone,
                    endTimeZone: browserTimeZone,
                    startDateTime: new Date(parseInt(event.startDateTime, 10)).toISOString(),
                    endDateTime: new Date(parseInt(event.endDateTime, 10)).toISOString(),
                    recurrence: event.recurrence,
                    sourceType: 'ENROLLMENT',
                    availabilityType: 'BUSY',
                };

                if (event.id) {
                    parsedEvent.id = event.id;
                }

                if (event.changeStatus) {
                    parsedEvent.changeStatus = event.changeStatus;
                }

                return parsedEvent;
            })
            .filter((event) => event.changeStatus);

        const dialogRef = this.dialog.open<ModalConfirmationComponent, ModalConfirmationDataOptions>(
            ModalConfirmationComponent,
            {
                restoreFocus: false,
                disableClose: true,
                data: {
                    message: 'Are you sure?',
                },
            },
        );

        dialogRef
            .afterClosed()
            .pipe(
                take(1),
                switchMap((confirm: boolean) => {
                    if (!confirm) {
                        return EMPTY;
                    }

                    return this.classroomService.changeEnrollmentSchedule({ enrollmentId, events });
                }),
            )
            .subscribe({
                next: (changeScheduleEnrollment: Enrollment) => {
                    this.dialogRef.close(changeScheduleEnrollment);
                },
            });
    }

    onTransferEnrollment() {
        const {
            studentInfo: { firstName },
        } = this.studentForm.getRawValue();

        const { level } = this.courseForm.getRawValue();
        const { events: unparsedEvents } = this.eventsForm.getRawValue();

        let browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (!browserTimeZone) {
            // default to SP if not found
            browserTimeZone = 'America/Sao_Paulo';
        }

        const enrollmentId = this.editingEnrollment.id;

        const events: Event[] = unparsedEvents.map((event) => {
            const parsedEvent: Event = {
                title: `${firstName} (1 on 1)`,
                description: level.name,
                startTimeZone: browserTimeZone,
                endTimeZone: browserTimeZone,
                startDateTime: new Date(parseInt(event.startDateTime, 10)).toISOString(),
                endDateTime: new Date(parseInt(event.endDateTime, 10)).toISOString(),
                recurrence: event.recurrence,
            };

            if (event.id) {
                parsedEvent.id = event.id;
            }

            return parsedEvent;
        });

        const dialogRef = this.dialog.open<ModalConfirmationComponent, ModalConfirmationDataOptions>(
            ModalConfirmationComponent,
            {
                restoreFocus: false,
                disableClose: true,
                data: {
                    title: 'Transfer Enrollment',
                    message: 'Are you sure you want to move this enrollment to One-on-one?',
                },
            },
        );

        dialogRef
            .afterClosed()
            .pipe(
                take(1),
                switchMap((confirm: boolean) => {
                    if (!confirm) {
                        return EMPTY;
                    }

                    return this.classroomService.transferEnrollment(enrollmentId, events);
                }),
            )
            .subscribe({
                next: (enrollmentTransferInvitation: Enrollment) => {
                    this.dialogRef.close(enrollmentTransferInvitation);
                },
            });
    }

    onCancelEnrollment() {
        const enrollmentId = this.editingEnrollment.id;

        const dialogRef = this.dialog.open<ModalConfirmationComponent, ModalConfirmationDataOptions>(
            ModalConfirmationComponent,
            {
                restoreFocus: false,
                disableClose: true,
                data: {
                    title: 'Cancel enrollment',
                    message: 'Are you sure you want to cancel this enrollment?',
                },
            },
        );

        dialogRef
            .afterClosed()
            .pipe(
                take(1),
                switchMap((confirm: boolean) => {
                    if (!confirm) {
                        return EMPTY;
                    }

                    return this.classroomService.cancelEnrollment(enrollmentId);
                }),
            )
            .subscribe({
                next: (cancelEnrollment: Enrollment) => {
                    this.dialogRef.close(cancelEnrollment);
                },
            });
    }

    onUpdateGroup(): void {
        const { name } = this.groupForm.getRawValue();

        const { level } = this.courseForm.getRawValue();
        const { events: unparsedEvents } = this.eventsForm.getRawValue();

        let browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (!browserTimeZone) {
            // default to SP if not found
            browserTimeZone = 'America/Sao_Paulo';
        }

        const studyGroupId = this.editingGroup.id;

        const events = unparsedEvents
            .map((event) => {
                const parsedEvent: Event = {
                    title: `${name}`,
                    description: level.name,
                    startTimeZone: browserTimeZone,
                    endTimeZone: browserTimeZone,
                    startDateTime: new Date(parseInt(event.startDateTime, 10)).toISOString(),
                    endDateTime: new Date(parseInt(event.endDateTime, 10)).toISOString(),
                    recurrence: event.recurrence,
                    sourceType: 'STUDY_GROUP',
                    availabilityType: 'BUSY',
                };

                if (event.id) {
                    parsedEvent.id = event.id;
                }

                if (event.changeStatus) {
                    parsedEvent.changeStatus = event.changeStatus;
                }

                return parsedEvent;
            })
            .filter((event) => event.changeStatus);

        const dialogRef = this.dialog.open<ModalConfirmationComponent, ModalConfirmationDataOptions>(
            ModalConfirmationComponent,
            {
                restoreFocus: false,
                disableClose: true,
                data: {
                    message: 'Are you sure?',
                },
            },
        );

        dialogRef
            .afterClosed()
            .pipe(
                take(1),
                switchMap((confirm: boolean) => {
                    if (!confirm) {
                        return EMPTY;
                    }

                    return this.classroomService.updateStudyGroup({ studyGroupId, name, events });
                }),
            )
            .subscribe({
                next: (group: StudyGroup) => {
                    this.dialogRef.close(group);
                },
            });
    }

    // -- SAVE METHODS

    // STUDENT
    get studentInfoForm() {
        return this.studentForm.get('studentInfo') as FormGroup;
    }

    get selectedGroupControl() {
        return this.studentForm.get('selectedGroup') as FormControl;
    }

    // GROUP
    get groupNameControl() {
        return this.groupForm.get('name') as FormControl;
    }

    get sourceTypeControl() {
        return this.courseForm.get('sourceType') as FormControl;
    }

    get programControl() {
        return this.courseForm.get('program') as FormControl;
    }

    get levelControl() {
        return this.courseForm.get('level') as FormControl;
    }

    get events() {
        return this.eventsForm.get('events') as FormArray;
    }

    get type(): string {
        return this.data?.type;
    }

    get editingEnrollment() {
        return this.data?.enrollment;
    }

    get editingGroup() {
        return this.data?.group;
    }

    get selectedGroup() {
        return this.data?.selectedGroup;
    }

    get selectedTab(): ITab {
        return this.tabs.find((tab) => tab.active);
    }

    get tabs() {
        return this.data?.tabs;
    }

    get isMobile() {
        return this.mediaObserver.isActive('xs');
    }
}
