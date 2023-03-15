import { Pipe, PipeTransform } from '@angular/core';
import { ClassRecordType } from 'app/@core/models/class-record.model';

@Pipe({
    name: 'parseCompletedLessons',
})
export class ParseCompletedLessonsPipe implements PipeTransform {
    transform(classRecords: ClassRecordType[], args?: any): any {
        if (!classRecords || classRecords.length === 0) {
            return 0;
        }

        const lessonsDoneLength = classRecords.filter((classRecord) => classRecord.status === 'LESSON_DONE').length;

        return lessonsDoneLength;
    }
}
