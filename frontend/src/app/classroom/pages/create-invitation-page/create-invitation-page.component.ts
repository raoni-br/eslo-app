import { WeeklyAvailabilityDialogComponent } from './../../../@shared/components/calendar/weekly-availability-dialog/weekly-availability-dialog.component';
import { WeeklyAvailabilityComponent } from 'app/@shared/components/calendar/weekly-availability/weekly-availability.component';
import { CdkStepper } from '@angular/cdk/stepper';
import { debounceTime, map, startWith, switchMap, take, takeUntil } from 'rxjs/operators';
import { combineLatest, EMPTY, of, Subject } from 'rxjs';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    EventHasNoDaySelectedValidator,
    EventHasScheduleConflictValidator,
    EventHasStartAndEndTimeConflictValidator,
    EventsWithSameDateValidator,
} from 'app/@shared/components/calendar/schedule-input/validators';
import { ClassroomService } from 'app/@core/services/classroom.service';
import { Event } from 'app/@core/models/event.model';
import { MatDialog } from '@angular/material/dialog';
import { MediaObserver } from '@angular/flex-layout';
import { Enrollment, StudyGroup } from 'app/@core/models/enrollment.model';
import {
    ModalConfirmationComponent,
    ModalConfirmationDataOptions,
} from 'app/@shared/components/modal-confirmation/modal-confirmation.component';
import { CreateEnrollmentInput } from 'app/@core/models/enrollment-invitation.model';
import { CreateStudyGroupInput } from '../groups-page/groups-page.component';

export type Entity = 'student' | 'group';

@Component({
    selector: 'app-create-invitation-page',
    templateUrl: './create-invitation-page.component.html',
    styleUrls: ['./create-invitation-page.component.scss'],
})
export class CreateInvitationPageComponent implements OnInit, OnDestroy {
    studentSteps = [
        {
            header: 'Student info',
            subheading: 'Name and email',
            icon: 'account_box',
            completed: false,
            editable: true,
        },
        {
            header: 'Class info',
            subheading: '1-on-1 or group',
            icon: 'groups',
            completed: false,
            editable: true,
        },
        {
            header: 'Course info',
            subheading: 'Course and level',
            icon: 'school',
            completed: false,
            editable: true,
        },
        {
            header: 'Schedule info',
            subheading: 'Days of the week, time and length',
            icon: 'schedule',
            completed: false,
            editable: true,
        },
        {
            header: 'Completed',
            subheading: 'Send invitation',
            icon: 'done_outline',
            completed: false,
            editable: true,
        },
    ];

    groupSteps = [
        {
            header: 'Group info',
            subheading: 'Name',
            icon: 'account_box',
            editable: true,
            completed: false,
        },
        {
            header: 'Course info',
            subheading: 'Course and level',
            icon: 'school',
            editable: true,
            completed: false,
        },
        {
            header: 'Schedule info',
            subheading: 'Days of the week, time and length',
            icon: 'schedule',
            editable: true,
            completed: false,
        },
        {
            header: 'Completed',
            subheading: 'Create group',
            icon: 'done_outline',
            editable: true,
            completed: false,
        },
    ];

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

    entity: Entity;

    @ViewChild('stepper') stepper: CdkStepper;

    groups$ = of([]);

    // editingEnrollment = this.classroomService.editingEnrollment;
    // editingGroup = this.classroomService.editingGroup;

    editingEnrollment: Enrollment | null = null;
    editingGroup: StudyGroup | null = null;
    selectedGroup: StudyGroup | null = null;

    private resetEventsFormTimeout: ReturnType<typeof setTimeout>;
    private destroy$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private classroomService: ClassroomService,
        private formBuilder: FormBuilder,
        private dialog: MatDialog,
        private mediaObserver: MediaObserver,
    ) {}

    async ngOnInit() {
        this.entity = this.route.snapshot.paramMap.get('entity') as Entity;
        const entityId = this.route.snapshot.paramMap.get('id');
        const selectedGroupId = this.route.snapshot.queryParamMap.get('groupId');
        if (this.entity === 'student' && entityId) {
            this.editingEnrollment = await this.classroomService.getEnrollment(entityId).pipe(take(1)).toPromise();

            if (selectedGroupId) {
                this.selectedGroup = await this.classroomService
                    .getGroupById(selectedGroupId)
                    .pipe(take(1))
                    .toPromise();
            }
        } else if (this.entity === 'group' && entityId) {
            this.editingGroup = await this.classroomService.getGroupById(entityId).pipe(take(1)).toPromise();
        }

        if (this.entity === 'student') {
            this.checkEditingEnrollment();
            this.listenSourceTypeChange();

            if (!this.editingEnrollment) {
                this.addEvent();
            }
            if (this.editingEnrollment) {
                this.checkSelectedGroup();
            }
        }

        if (this.entity === 'group') {
            this.checkEditingGroup();
            this.sourceTypeControl.setValidators([]);
            this.sourceTypeControl.updateValueAndValidity();

            if (!this.editingGroup) {
                this.addEvent();
            }
        }

        this.calculateFormProgress();
        this.listenSourceTypeChange();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
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

                    if (this.entity === 'group') {
                        if (this.editingGroup ? true : this.groupForm.valid) {
                            this.groupSteps[0].completed = true;
                        } else {
                            this.groupSteps[0].completed = false;
                        }
                        if (program && level) {
                            this.groupSteps[1].completed = true;
                        } else {
                            this.groupSteps[1].completed = false;
                        }
                        if (this.events.valid) {
                            this.groupSteps[2].completed = true;
                        } else {
                            this.groupSteps[2].completed = false;
                        }
                    } else if (this.entity === 'student') {
                        if (this.editingEnrollment ? true : this.studentInfoForm.valid) {
                            this.studentSteps[0].completed = true;
                        } else {
                            this.studentSteps[0].completed = false;
                        }
                        if ((sourceType === 'group' && selectedGroup) || sourceType === 'oneOnOne') {
                            this.studentSteps[1].completed = true;
                        } else {
                            this.studentSteps[1].completed = false;
                        }

                        if (sourceType === 'oneOnOne' && program && level) {
                            this.studentSteps[2].completed = true;
                        } else {
                            this.studentSteps[2].completed = false;
                        }

                        if (sourceType === 'oneOnOne' && this.events.valid) {
                            this.studentSteps[3].completed = true;
                        } else {
                            this.studentSteps[3].completed = false;
                        }
                    }
                },
            });
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
                        this.events.updateValueAndValidity();

                        if (!this.editingEnrollment) {
                            this.programControl.reset();
                            this.events.clear();
                            this.levelControl.reset();
                        }

                        this.studentSteps[2].editable = false;
                        this.studentSteps[3].editable = false;
                    }, 0);
                }

                if (sourceType === 'oneOnOne') {
                    this.studentSteps[2].editable = true;
                    this.studentSteps[3].editable = true;

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

    onOpenAvailability() {
        this.dialog.open(WeeklyAvailabilityDialogComponent, {
            panelClass: 'weekly-availability-dialog',
            data: {
                eventsToAdd: this.events.value,
            },
        });
    }

    // SAVE METHODS
    onSubmit() {
        if (this.entity === 'group') {
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

            this.addGroup(formValues);
            return;
        }

        if (this.entity === 'student') {
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

            this.addStudent(formValues);
        }
    }

    addStudent(formValues) {
        if (!formValues) {
            return;
        }

        const { studentForm, courseForm, eventsForm } = formValues;

        let browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (!browserTimeZone) {
            // default to SP if not found
            browserTimeZone = 'America/Sao_Paulo';
        }

        const enrollmentInvitation: CreateEnrollmentInput = {
            invitedStudent: {
                email: studentForm.studentInfo.email,
                firstName: studentForm.studentInfo.firstName,
                surname: studentForm.studentInfo.lastName,
            },
            enrollmentInput: {},
        };

        if (studentForm?.selectedGroup) {
            enrollmentInvitation.enrollmentInput.studyGroupId = studentForm?.selectedGroup?.id;
        } else {
            enrollmentInvitation.enrollmentInput.oneOnOne = {
                levelId: courseForm.level.id,
                events: eventsForm.events.map((event: Event) => ({
                    title: `${studentForm.studentInfo.firstName} ${
                        studentForm.studentInfo.lastName ? studentForm.studentInfo.lastName : ''
                    } (1 on 1)`,
                    description: courseForm.level.name,
                    sourceType: 'ENROLLMENT',
                    availabilityType: 'BUSY',
                    status: 'TENTATIVE',
                    recurrence: event.recurrence,
                    startDateTime: new Date(parseInt(event.startDateTime, 10)).toISOString(),
                    startTimeZone: browserTimeZone,
                    endDateTime: new Date(parseInt(event.endDateTime, 10)).toISOString(),
                    endTimeZone: browserTimeZone,
                })),
            };
        }

        this.classroomService
            .createEnrollmentInvitation(enrollmentInvitation)
            .pipe(take(1))
            .subscribe((newEnrollment: Enrollment) => {
                if (newEnrollment) {
                    this.classroomService.classroomRefetch();
                    this.router.navigate(['/classroom', 'students']);
                }
            });
    }

    addGroup(formValues) {
        if (!formValues) {
            return;
        }

        const { groupForm, courseForm, eventsForm } = formValues;

        let browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (!browserTimeZone) {
            // default to SP if not found
            browserTimeZone = 'America/Sao_Paulo';
        }

        const newGroup: CreateStudyGroupInput = {
            name: groupForm.name,
            levelId: courseForm.level.id,
            events: eventsForm.events.map((event: Event) => ({
                title: groupForm.name,
                description: courseForm.level.name,
                sourceType: 'STUDY_GROUP',
                availabilityType: 'BUSY',
                recurrence: event.recurrence,
                startDateTime: new Date(parseInt(event.startDateTime, 10)).toISOString(),
                startTimeZone: browserTimeZone,
                endDateTime: new Date(parseInt(event.endDateTime, 10)).toISOString(),
                endTimeZone: browserTimeZone,
            })),
        };

        this.classroomService.createStudyGroup(newGroup).subscribe((addedGroup: any) => {
            this.classroomService.getGroupsQuery().refetch();
            this.router.navigate(['/classroom', 'groups']);
        });
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
                    this.classroomService.classroomRefetch();
                    this.router.navigate(['/classroom', 'students']);
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
                    this.classroomService.classroomRefetch();
                    this.router.navigate(['/classroom', 'students']);
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
                    this.classroomService.classroomRefetch();
                    this.router.navigate(['/classroom', 'students']);
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
                    this.classroomService.getGroupsQuery().refetch();
                    this.router.navigate(['/classroom', 'groups']);
                },
            });
    }
    // -- SAVE METHODS

    onSelectStep(index: number) {
        const currentStep = this.stepper.steps.get(this.stepper.selectedIndex);
        const stepClicked = this.stepper.steps.get(index);

        if (!stepClicked.editable) {
            return;
        }

        if ((currentStep.completed && index === this.stepper.selectedIndex + 1) || stepClicked.completed) {
            this.stepper.selectedIndex = index;
        }
    }

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

    get isMobile() {
        return this.mediaObserver.isActive('xs');
    }
}
