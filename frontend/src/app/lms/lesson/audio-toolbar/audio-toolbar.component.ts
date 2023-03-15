import { Component, Input, OnChanges } from '@angular/core';
import { MediaAssociation } from 'app/@core/models/lesson-material.model';

@Component({
    selector: 'app-audio-toolbar',
    templateUrl: './audio-toolbar.component.html',
    styleUrls: ['./audio-toolbar.component.scss'],
})
export class AudioToolbarComponent implements OnChanges {
    @Input() audioList: MediaAssociation[];
    currentAudio: MediaAssociation;

    constructor() {}

    ngOnChanges(): void {
        if (this.audioList?.length > 0) {
            this.currentAudio = this.audioList[0];
        }
    }
}
