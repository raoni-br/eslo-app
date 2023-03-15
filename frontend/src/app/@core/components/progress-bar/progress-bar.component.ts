import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ProgressBarService } from './progress-bar.service';

@Component({
    selector: 'app-progress-bar',
    templateUrl: './progress-bar.component.html',
    styleUrls: ['./progress-bar.component.scss'],
})
export class ProgressBarComponent implements OnInit, OnDestroy {
    bufferValue: number;
    mode: 'determinate' | 'indeterminate' | 'buffer' | 'query';
    value: number;
    visible: boolean;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param _fuseProgressBarService
     */
    constructor(private progressBarService: ProgressBarService, private cdr: ChangeDetectorRef) {
        // Set the defaults

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to the progress bar service properties

        // Buffer value
        this.progressBarService.bufferValue.pipe(takeUntil(this._unsubscribeAll)).subscribe((bufferValue) => {
            this.bufferValue = bufferValue;
        });

        // Mode
        this.progressBarService.mode.pipe(takeUntil(this._unsubscribeAll)).subscribe((mode) => {
            this.mode = mode;
        });

        // Value
        this.progressBarService.value.pipe(takeUntil(this._unsubscribeAll)).subscribe((value) => {
            this.value = value;
        });

        // Visible
        this.progressBarService.visible.pipe(takeUntil(this._unsubscribeAll)).subscribe((visible) => {
            this.visible = visible;
            this.cdr.detectChanges();
        });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
}
