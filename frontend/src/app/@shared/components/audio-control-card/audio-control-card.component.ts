import {
    Component,
    ElementRef,
    HostListener,
    Input,
    OnChanges,
    OnDestroy,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSelectChange } from '@angular/material/select';
import { MediaAssociation } from 'app/@core/models/lesson-material.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AudioService, StreamState } from './audio.service';

@Component({
    selector: 'app-audio-control-card',
    templateUrl: './audio-control-card.component.html',
    styleUrls: ['./audio-control-card.component.scss'],
})
export class AudioControlCardComponent implements OnChanges, OnDestroy {
    files: Array<any> = [];
    state: StreamState;
    currentFile: any = {};

    @Input() audioList: MediaAssociation[];

    @ViewChild('audioProgressBar') audioProgressBar: MatProgressBar;

    currentAudio: any;

    showVolume = false;

    private destroy$ = new Subject<void>();

    @HostListener('document:click', ['$event'])
    clickOut(event) {
        if (!this.elementRef.nativeElement.contains(event.target) && this.showVolume) {
            this.showVolume = false;
        }
    }

    @HostListener('document:keydown.escape', ['$event'])
    onKeydownHandler(event: KeyboardEvent) {
        if (this.showVolume) {
            this.showVolume = false;
        }
    }

    constructor(
        private audioService: AudioService,
        private elementRef: ElementRef,
        private mediaObserver: MediaObserver,
    ) {
        // listen to stream state
        this.audioService
            .getState()
            .pipe(takeUntil(this.destroy$))
            .subscribe((state) => {
                this.state = state;
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    ngOnChanges(changes: SimpleChanges): void {
        const audioList = changes['audioList'];
        if (audioList.currentValue) {
            this.currentAudio = this.audioList[0];
            this.openFile(audioList.currentValue[0].media.rootUri, 0);
        }
    }

    onChangeCurrentAudio({ value }: MatSelectChange) {
        this.currentAudio = value;
        this.openFile(value.media.rootUri, value.media.order - 1);
    }

    playStream(url) {
        this.audioService
            .playStream(url)
            .pipe(takeUntil(this.destroy$))
            .subscribe((events) => {
                // listening for fun here
            });
    }

    openFile(url, index) {
        this.currentFile = { index, url };
        this.audioService.stop();
        this.playStream(url);
        this.pause();
    }

    pause() {
        this.audioService.pause();
    }

    play() {
        this.audioService.play();
    }

    stop() {
        this.audioService.stop();
    }

    toggleMuted() {
        if (this.showVolume) {
            this.audioService.toggleMuted();
        }
    }

    toggleVolume() {
        this.showVolume = !this.showVolume;
    }

    next() {
        const index = this.currentFile.index + 1;
        const file = this.files[index];
        this.openFile(file, index);
    }

    previous() {
        const index = this.currentFile.index - 1;
        const file = this.files[index];
        this.openFile(file, index);
    }

    isFirstPlaying() {
        return this.currentFile.index === 0;
    }

    isLastPlaying() {
        return this.currentFile.index === this.files.length - 1;
    }

    onSliderChangeEnd(change) {
        this.audioService.seekTo(change.value);
    }

    onChangeVolume(volume: number) {
        this.audioService.changeVolume(volume);
    }

    get isMobile() {
        return this.mediaObserver.isActive('xs');
    }
}
