import { Pipe, PipeTransform } from '@angular/core';
import { ClassRecord, ClassRecordType } from 'app/@core/models/class-record.model';

@Pipe({
    name: 'isLastClassLessonDone',
})
export class IsLastClassLessonDonePipe implements PipeTransform {
    transform(value: any, args?: any): any {
        const lesson = value;
        let tracker = lesson?.classRecords || lesson?.studyGroupLessonRecord;
        if (!tracker || tracker.length === 0) {
            return undefined;
        }

        let lastClass: ClassRecordType;
        tracker.forEach((classLectured: ClassRecordType) => {
            const currentStartedDate = new Date(parseInt(classLectured.startedAt, 10)).getDate();
            if (!lastClass || parseInt(classLectured.startedAt, 10) > parseInt(lastClass.startedAt, 10)) {
                lastClass = classLectured;
            }
        });

        return lastClass?.status === 'LESSON_DONE';
    }
}
