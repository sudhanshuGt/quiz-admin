import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Exam } from './exam.model';
import { Syllabus } from './exam.model';
import { Chapter } from './exam.model';
import { Question } from './exam.model';

 

@Injectable({ providedIn: 'root' })
export class QuizHierarchyService {
  constructor(private fs: Firestore) {}

  // EXAMS
  getExams(): Observable<Exam[]> {
    return collectionData(collection(this.fs, 'exams'), { idField: 'id' }) as Observable<Exam[]>;
  }
  createExam(exam: Exam) {
    return addDoc(collection(this.fs, 'exams'), exam);
  }

  // SYLLABUS
  getSyllabusForExam(examId: string): Observable<Syllabus[]> {
    return collectionData(collection(this.fs, `exams/${examId}/syllabus`), { idField: 'id' }) as Observable<Syllabus[]>;
  }
  createSyllabus(examId: string, syllabus: Syllabus) {
    return addDoc(collection(this.fs, `exams/${examId}/syllabus`), syllabus);
  }

  // CHAPTERS
  getChapters(examId: string, syllabusId: string): Observable<Chapter[]> {
    return collectionData(collection(this.fs, `exams/${examId}/syllabus/${syllabusId}/chapters`), { idField: 'id' }) as Observable<Chapter[]>;
  }
  createChapter(examId: string, syllabusId: string, chapter: Chapter) {
    return addDoc(collection(this.fs, `exams/${examId}/syllabus/${syllabusId}/chapters`), chapter);
  }

  // QUESTIONS
  // top-level
  createTopLevelQuestion(question: Question) {
    return addDoc(collection(this.fs, 'questions'), question);
  }
  // hierarchical
  createQuestionUnderChapter(examId: string, syllabusId: string, chapterId: string, question: Question) {
    return addDoc(collection(this.fs, `exams/${examId}/syllabus/${syllabusId}/chapters/${chapterId}/questions`), question);
  }
}

