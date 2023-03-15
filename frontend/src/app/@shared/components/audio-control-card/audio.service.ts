import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

export interface StreamState {
    playing: boolean;
    muted: boolean;
    readableCurrentTime: string;
    readableDuration: string;
    duration: number | undefined;
    currentTime: number | undefined;
    volume: number | undefined;
    canplay: boolean;
    error: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class AudioService {
    private stop$ = new Subject();
    private audioObj = new Audio();
    audioEvents = [
        'ended',
        'error',
        'play',
        'playing',
        'pause',
        'timeupdate',
        'canplay',
        'loadedmetadata',
        'loadstart',
        'volumechange',
    ];
    private state: StreamState = {
        playing: false,
        muted: false,
        readableCurrentTime: '',
        readableDuration: '',
        duration: undefined,
        currentTime: undefined,
        canplay: false,
        error: false,
        volume: 100,
    };

    private stateChange: BehaviorSubject<StreamState> = new BehaviorSubject(this.state);

    private streamObservable(url: string) {
        return new Observable((observer) => {
            // Play audio
            this.audioObj.src = url;
            this.audioObj.load();
            this.audioObj.play();

            const handler = (event: Event) => {
                this.updateStateEvents(event);
                observer.next(event);
            };

            this.addEvents(this.audioObj, this.audioEvents, handler);
            return () => {
                // Stop Playing
                this.audioObj.pause();
                this.audioObj.currentTime = 0;
                // remove event listeners
                this.removeEvents(this.audioObj, this.audioEvents, handler);
                // reset state
                this.resetState();
            };
        });
    }

    private addEvents(obj, events, handler) {
        events.forEach((event) => {
            obj.addEventListener(event, handler);
        });
    }

    private removeEvents(obj, events, handler) {
        events.forEach((event) => {
            obj.removeEventListener(event, handler);
        });
    }

    playStream(url: string) {
        return this.streamObservable(url).pipe(takeUntil(this.stop$));
    }

    play() {
        this.audioObj.play();
    }

    pause() {
        this.audioObj.pause();
    }

    toggleMuted() {
        this.audioObj.muted = !this.audioObj.muted;
        this.state = {
            ...this.state,
            muted: this.audioObj.muted,
        };
        this.stateChange.next(this.state);
    }

    stop() {
        this.stop$.next();
    }

    seekTo(seconds: number) {
        this.audioObj.currentTime = seconds;
    }

    changeVolume(volume: number) {
        this.audioObj.volume = volume / 100;
        this.state = {
            ...this.state,
            volume,
        };
        this.stateChange.next(this.state);

        if (volume === 0 && !this.state.muted) {
            this.toggleMuted();
        } else if (volume > 0 && this.state.muted) {
            this.toggleMuted();
        }
    }

    formatTime(time: number, format: string = 'mm:ss') {
        const momentTime = time * 1000;
        return moment.utc(momentTime).format(format);
    }

    private updateStateEvents(event: Event): void {
        switch (event.type) {
            case 'canplay':
                this.state.duration = this.audioObj.duration;
                this.state.readableDuration = this.formatTime(this.state.duration);
                this.state.canplay = true;
                break;
            case 'playing':
                this.state.playing = true;
                break;
            case 'pause':
                this.state.playing = false;
                break;
            case 'timeupdate':
                this.state.currentTime = this.audioObj.currentTime;
                this.state.readableCurrentTime = this.formatTime(this.state.currentTime);
                break;
            case 'volumechange':
                break;
            case 'error':
                this.resetState();
                this.state.error = true;
                break;
        }
        this.stateChange.next(this.state);
    }

    private resetState() {
        this.state = {
            playing: false,
            muted: false,
            readableCurrentTime: '',
            readableDuration: '',
            duration: undefined,
            currentTime: undefined,
            canplay: false,
            error: false,
            volume: 100,
        };
    }

    getState(): Observable<StreamState> {
        return this.stateChange.asObservable();
    }
}
