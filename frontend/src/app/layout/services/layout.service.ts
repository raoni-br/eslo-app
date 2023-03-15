import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LayoutService {
    private scrollSource = new Subject<any>();
    scroll$ = this.scrollSource.asObservable();

    constructor() {}

    onScroll(evt: any) {
        this.scrollSource.next(evt);
    }
}
