import { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { StudyGroup } from 'app/@core/models/enrollment.model';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, startWith } from 'rxjs/operators';
import { ScheduleInputDialogComponent } from '../schedule-input-dialog/schedule-input-dialog.component';

@Component({
    selector: 'app-select-group-enrollment',
    templateUrl: './select-group-enrollment.component.html',
    styleUrls: ['./select-group-enrollment.component.scss'],
})
export class SelectGroupEnrollmentComponent implements OnInit {
    @Input() groups: StudyGroup[];

    _selectedGroupControl: FormControl;
    get selectedGroupControl() {
        return this._selectedGroupControl;
    }
    @Input()
    set selectedGroupControl(value) {
        this._selectedGroupControl = value;
    }

    @Input() programControl: FormControl;
    @Input() levelControl: FormControl;

    groupSearchInputFocus = false;
    groupSearchInput = new FormControl();
    groupSearchTerm$: Observable<string>;
    filteredGroups$: Observable<StudyGroup[]>;

    constructor(private matDialog: MatDialog) {}

    ngOnInit() {
        this.filteredGroups$ = this.groupSearchInput.valueChanges.pipe(
            startWith(this.groups),
            filter((value) => !value || value.length > 2),
            debounceTime(350),
            distinctUntilChanged(),
            map((term) => {
                if (!term) {
                    return this.groups;
                }

                term = term.toLowerCase();

                const groups = [...this.groups];

                return groups.filter((group) => {
                    const hasTerm =
                        group.name.toLowerCase().includes(term) ||
                        group.level.label.toLowerCase().includes(term) ||
                        group.level.module.program.label.toLowerCase().includes(term);

                    return hasTerm;
                });
            }),
        );
    }

    onShowSchedule(group: StudyGroup) {
        this.matDialog.open(ScheduleInputDialogComponent, {
            panelClass: 'schedule-input-dialog',
            autoFocus: false,
            data: {
                group,
            },
        });
    }
}
