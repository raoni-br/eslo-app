import { ClassroomService } from '../../../@core/services/classroom.service';
import { Component, OnInit, Inject } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
    FormArray,
    ValidationErrors,
    ValidatorFn,
} from '@angular/forms';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { RRule, Weekday } from 'rrule';

import { Program } from 'app/@core/models/program.model';
import { Level } from 'app/@core/models/level.model';
import { LMSService } from 'app/@core/services/lms.service';
import { EnrollmentInvitationInput } from 'app/@core/models/enrollment-invitation.model';
import { Event } from 'app/@core/models/event.model';
import { Enrollment } from 'app/@core/models/enrollment.model';
import {
    ModalConfirmationComponent,
    ModalConfirmationDataOptions,
} from 'app/@shared/components/modal-confirmation/modal-confirmation.component';
import { switchMap, take } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

@Component({
    selector: 'app-invitation-form',
    templateUrl: './invitation-form.component.html',
    styleUrls: ['./invitation-form.component.scss'],
})
export class InvitationFormComponent implements OnInit {
    enrollmentInvitation: EnrollmentInvitationInput;
    enrollmentForm: FormGroup;
    dialogTitle: string;

    selectedProgram: Program;
    acceptedTerms = false;
    programs: Program[];
    levels: Level[];

    weekDays: Weekday[] = [RRule.SU, RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA];

    /**
     * Constructor
     *
     * @param matDialogRef
     * @param _data
     * @param _formBuilder
     */
    constructor(
        public matDialogRef: MatDialogRef<InvitationFormComponent>,
        private _formBuilder: FormBuilder,
        private lmsService: LMSService,
        private classroomService: ClassroomService,
        private dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) private data: { enrollment: Enrollment },
    ) {
        // Set the defaults
        this.levels = [];
        this.programs = [];
        this.enrollmentInvitation = {
            invitation: {
                sourceType: 'ENROLLMENT',
            },
            enrollment: {},
        };

        if (this.updateEnrollment) {
            this.enrollmentInvitation.enrollment = this.updateEnrollment;
        }

        this.enrollmentForm = this.createInvitationForm();
    }

    ngOnInit(): void {
        this.lmsService.getPrograms().subscribe({
            next: (programs) => {
                this.programs = programs;

                // select current program and level from updated enrollment
                if (this.updateEnrollment) {
                    const levelCode = this.enrollmentInvitation.enrollment?.level?.code;
                    const programCode = levelCode.split('-').shift();
                    const currentEnrollmentProgram = programs.find((program) => program.code === programCode);

                    this.enrollmentForm.patchValue({
                        program: currentEnrollmentProgram,
                    });

                    this.getLevels();

                    const currentEnrollmentLevel = this.levels.find((level) => level.code === levelCode);

                    this.enrollmentForm.patchValue({
                        level: currentEnrollmentLevel,
                    });
                }
            },
        });
    }

    getLevels(): void {
        const program = this.programFormControl.value;
        this.levels = [].concat(...program.modules.map((module) => module.levels));
    }

    /**
     * Create invitation form
     *
     * @returns
     */
    createInvitationForm(): FormGroup {
        return this._formBuilder.group({
            firstName: [
                this.enrollmentInvitation.enrollment?.student?.firstName ||
                    this.enrollmentInvitation.invitation.inviteeFirstName,
                Validators.compose([Validators.required, Validators.pattern('^[A-Za-zñÑáéíóúÁÉÍÓÚ ]+$')]),
            ],
            lastName: [
                this.enrollmentInvitation.enrollment?.student?.familyName ||
                    this.enrollmentInvitation.invitation.inviteeSurname,
                Validators.compose([Validators.required, Validators.pattern('^[A-Za-zñÑáéíóúÁÉÍÓÚ ]+$')]),
            ],
            email: [
                this.enrollmentInvitation.enrollment?.student?.primaryEmail ||
                    this.enrollmentInvitation.invitation.inviteeEmail,
                [Validators.required, Validators.email],
            ],
            program: [this.selectedProgram, Validators.required],
            level: [this.enrollmentInvitation.enrollment.level, Validators.required],
            events: this._formBuilder.array(
                this.enrollmentInvitation?.enrollment?.events
                    ? this.enrollmentInvitation?.enrollment?.events
                    : this.createEventsFormControl(),
                [ValidateEvents, Validators.minLength(1)],
            ),
            termsAndConditions: [
                this.enrollmentInvitation?.enrollment?.events ? true : this.acceptedTerms,
                Validators.requiredTrue,
            ],
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Events methods (time slots)
    // -----------------------------------------------------------------------------------------------------

    private createEventsFormControl(): FormControl[] {
        const newEvent: Event = {};
        return [this._formBuilder.control(newEvent)];
    }

    // Get the events from the form array
    get events(): FormArray {
        return this.enrollmentForm.get('events') as FormArray;
    }

    // Get program from form
    get programFormControl(): FormControl {
        return this.enrollmentForm.get('program') as FormControl;
    }

    updateEvent(event: Event, controlIndex: number): void {
        // see if event has an id to only set the change status to edited
        const currentEvent = this.events.at(controlIndex);
        if (currentEvent.value.id) {
            this.events.at(controlIndex).setValue({ ...event, changeStatus: 'EDITED' });
            return;
        }

        this.events.at(controlIndex).setValue(event);
    }

    // Push a new event to the Form Array
    addEvent(): void {
        const newEvent: Event = { changeStatus: 'NEW' };
        this.events.push(this._formBuilder.control(newEvent));
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
    // -----------------------------------------------------------------------------------------------------

    showDialogTermsAndConditions(): void {
        window.open('http://eslo.com.br/termos-e-condicoes/', '_blank');
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Enrollment methods
    // -----------------------------------------------------------------------------------------------------

    onCancel(): void {
        const enrollmentId = this.updateEnrollment.id;

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
                    this.matDialogRef.close(cancelEnrollment);
                },
            });
    }

    onChangeSchedule(): void {
        const { firstName, level, events: unparsedEvents } = this.enrollmentForm.getRawValue();

        let browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (!browserTimeZone) {
            // default to SP if not found
            browserTimeZone = 'America/Sao_Paulo';
        }

        const enrollmentId = this.updateEnrollment.id;

        const events = unparsedEvents
            .map((event) => {
                const parsedEvent: Event = {
                    title: `${firstName} (1 on 1)`,
                    description: level.name,
                    sourceType: 'ENROLLMENT',
                    availabilityType: 'BUSY',
                    startTimeZone: browserTimeZone,
                    endTimeZone: browserTimeZone,
                    startDateTime: new Date(parseInt(event.startDateTime, 10)).toISOString(),
                    endDateTime: new Date(parseInt(event.endDateTime, 10)).toISOString(),
                    recurrence: event.recurrence,
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
                    this.matDialogRef.close(changeScheduleEnrollment);
                },
            });
    }

    get updateEnrollment(): Enrollment {
        return this.data?.enrollment;
    }
    // -----------------------------------------------------------------------------------------------------
}

/**
 * Event validation
 *
 * @param events
 * @returns
 */
const ValidateEvents: ValidatorFn = (eventControls: FormArray): ValidationErrors | null => {
    let validEvents = true;
    if (!eventControls?.controls) {
        validEvents = false;
    } else {
        eventControls.controls.forEach((control) => {
            try {
                const event: Event = control.value;
                if (!(event && event.recurrence && event.startDateTime && event.endDateTime)) {
                    validEvents = false;
                } else {
                    const eventRecurrence = RRule.fromString(event.recurrence);
                    const eventStart = new Date(parseInt(event.startDateTime, 10));
                    const eventEnd = new Date(parseInt(event.endDateTime, 10));

                    if (
                        !(eventRecurrence.isFullyConvertibleToText() && eventStart && eventEnd && eventEnd > eventStart)
                    ) {
                        validEvents = false;
                    }
                }
            } catch (error: any) {
                return { invalidEvent: true };
            }
        });
    }

    if (validEvents) {
        return null;
    } else {
        return { invalidEvent: true };
    }
};
