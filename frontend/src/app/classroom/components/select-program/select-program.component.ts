import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Level } from 'app/@core/models/level.model';
import { Program } from 'app/@core/models/program.model';
import { LMSService } from 'app/@core/services/lms.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-select-program',
    templateUrl: './select-program.component.html',
    styleUrls: ['./select-program.component.scss'],
})
export class SelectProgramComponent implements OnInit, OnDestroy {
    @Input() programControl: FormControl;
    @Input() levelControl: FormControl;
    @Input() isEditing: boolean;

    selectedProgramIndex: number;
    localPrograms = [
        { name: 'business', icon: 'work', levels: ['B1', 'B2'] },
        { name: 'extensive', icon: 'backpack', levels: ['A1', 'A2', 'B1', 'B2', 'C1'] },
        { name: 'ielts', icon: 'grading', levels: ['A2', 'B1', 'B2'] },
    ];

    programs: Program[];
    levels: Level[];
    selectedLevelIndex: number;

    selectedTabIndex = 0;
    levelsA = [{ name: '' }, { name: 'A1' }, { name: 'A2' }, { name: 'B1' }, { name: 'B2' }, { name: 'C1' }];

    private destroy$ = new Subject<void>();

    constructor(private lmsService: LMSService) {}

    ngOnInit() {
        this.getPrograms();
        this.listenGroupProgramControl();
    }

    checkHasSelectedLevel() {
        if (!this.levelControl.value) {
            return;
        }
        const { code } = this.levelControl.value;
        const [programCode, type, levelCode] = code.split('-');
        const selectedProgramIndex = this.programs.findIndex((program) => program.code === programCode);
        this.onSelectProgram(selectedProgramIndex);

        const selectedLevelIndex = this.levels.findIndex((level) => level?.code.split('-').pop() === levelCode);
        this.selectedTabIndex = selectedLevelIndex;
        this.onLevelSelectedIndexChange(selectedLevelIndex);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    getPrograms() {
        this.lmsService.getPrograms().subscribe({
            next: (programs) => {
                this.programs = programs;

                this.checkHasSelectedLevel();
            },
        });
    }

    listenGroupProgramControl() {
        this.programControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe({
            next: (value) => {
                if (!value) {
                    return;
                }
                this.getLevels();
            },
        });
    }

    getLevels(): void {
        const program = this.programControl.value;
        /* first value it's null to show the correct tabs
           because in css the first one is hidden */
        this.levels = [].concat(...program.modules.map((module) => module.levels));
    }

    onSelectProgram(index: number): void {
        if (this.selectedProgramIndex === index) {
            return;
        }
        this.selectedProgramIndex = index;
        const selectedProgram = this.programs[this.selectedProgramIndex];
        this.programControl.setValue(selectedProgram);
        this.selectedTabIndex = 0;
    }

    onLevelSelectedIndexChange(levelIndex: number): void {
        const selectedLevel = this.levels[levelIndex];
        this.levelControl.setValue(selectedLevel);
    }

    onLevelSelected(levelIndex: number) {
        this.selectedLevelIndex = levelIndex;
        const selectedLevel = this.levels[levelIndex];
        this.levelControl.setValue(selectedLevel);
    }
}
