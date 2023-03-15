import { Apollo, gql } from 'apollo-angular';
import { ApolloQueryResult } from '@apollo/client/core';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Program } from 'app/@core/models/program.model';
import { Lesson } from 'app/@core/models/lesson.model';
import { PROGRAM_DETAILS, PROGRAM_SUMMARY } from '../graphql/program.graphql';
import { LESSON_DETAILS } from '../graphql/lesson.graphql';

interface IProgramResult {
    program: Program;
}

interface IProgramsResult {
    programs: Program[];
}
interface ILessonResult {
    lesson: Lesson;
}

@Injectable({
    providedIn: 'root',
})
export class LMSService {
    constructor(private apollo: Apollo) {}

    getPrograms(): Observable<Program[]> {
        return this.apollo
            .query({
                query: gql`
                    {
                        programs {
                            ...programSummary
                        }
                    }
                    ${PROGRAM_SUMMARY}
                `,
            })
            .pipe(map((result: ApolloQueryResult<IProgramsResult>) => result.data.programs));
    }

    getProgram(programId: string): Observable<Program> {
        return this.apollo
            .query({
                query: gql`
      {
        program(id: "${programId}") {
            ...programDetails
        }
      }
      ${PROGRAM_DETAILS}`,
            })
            .pipe(map((result: ApolloQueryResult<IProgramResult>) => result.data.program));
    }

    getLesson(lessonId: string): Observable<Lesson> {
        return this.apollo
            .query({
                query: gql`
      {
        lesson(id: "${lessonId}") {
            ...lessonDetails
        }
      }
      ${LESSON_DETAILS}`,
            })
            .pipe(map((result: ApolloQueryResult<ILessonResult>) => result.data.lesson));
    }
}
