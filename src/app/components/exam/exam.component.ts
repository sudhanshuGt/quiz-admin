import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule, NgModel, FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { QuizHierarchyService } from '../../quiz-hierarchy.service';
import { Exam } from '../../exam.model';
import { Syllabus } from '../../exam.model';
import { Chapter } from '../../exam.model';
import { Question } from '../../exam.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatOption, MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-exam-syllabus-chapter-question',
  templateUrl: './exam.component.html',
  styleUrls: ['./exam.component.scss'],
   imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatOption,
    MatInput,
    FormsModule
  ]
})
export class ExamComponent implements OnInit, OnDestroy {
  // data lists
  exams: Exam[] = [];
  syllabusList: Syllabus[] = [];
  chapterList: Chapter[] = [];

  // subscriptions
  examsSub?: Subscription;
  syllabusSub?: Subscription;
  chaptersSub?: Subscription;

  // forms
  examForm!: FormGroup;      // create exam
  syllabusForm!: FormGroup;  // create syllabus
  chapterForm!: FormGroup;   // create chapter
  questionForm!: FormGroup;  // single question
  bulkForm!: FormGroup;      // bulk paste

  // selection ids
  selectedExamId: string | null = null;
  selectedSyllabusId: string | null = null;
  selectedChapterId: string | null = null;

  constructor(private fb: FormBuilder, private svc: QuizHierarchyService) {}

  ngOnInit(): void {
    // create reactive forms
    this.examForm = this.fb.group({
      name: ['', Validators.required],
      imageUrl: ['']
    });

    this.syllabusForm = this.fb.group({
      name: ['', Validators.required],
      imageUrl: ['']
    });

    this.chapterForm = this.fb.group({
      name: ['', Validators.required],
      imageUrl: ['']
    });

    this.questionForm = this.fb.group({
      title: ['', Validators.required],
      options: this.fb.array([
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required)
      ]),
      correctAnswer: ['', Validators.required],
      imageUrl: ['']
    });

    this.bulkForm = this.fb.group({
      bulkText: ['']
    });

    // load exams (reactive)
    this.examsSub = this.svc.getExams().subscribe(list => {
      this.exams = list || [];
    });

    // watch selection changes? We'll use select handlers from template.
  }

  ngOnDestroy(): void {
    this.examsSub?.unsubscribe();
    this.syllabusSub?.unsubscribe();
    this.chaptersSub?.unsubscribe();
  }

  // helpers for options array
  get options(): FormArray {
    return this.questionForm.get('options') as FormArray;
  }

  // ----------------- EXAM -----------------
  async createExam() {
    if (this.examForm.invalid) {
      this.examForm.markAllAsTouched();
      return;
    }
    const payload: Exam = { name: this.examForm.value.name.trim(), imageUrl: this.examForm.value.imageUrl || undefined };
    await this.svc.createExam(payload);
    this.examForm.reset();
    // exams list updates via subscription
  }

  onSelectExam(examId: string | null) {
    this.selectedExamId = examId;
    this.selectedSyllabusId = null;
    this.selectedChapterId = null;
    this.syllabusList = [];
    this.chapterList = [];

    if (examId) {
      this.syllabusSub?.unsubscribe();
      this.syllabusSub = this.svc.getSyllabusForExam(examId).subscribe(list => {
        this.syllabusList = list || [];
      });
    }
  }

  // ----------------- SYLLABUS -----------------
  async createSyllabus() {
    if (!this.selectedExamId) {
      alert('Select an exam first');
      return;
    }
    if (this.syllabusForm.invalid) {
      this.syllabusForm.markAllAsTouched();
      return;
    }
    const payload: Syllabus = { examId: this.selectedExamId, name: this.syllabusForm.value.name.trim(), imageUrl: this.syllabusForm.value.imageUrl || undefined };
    await this.svc.createSyllabus(this.selectedExamId, payload);
    this.syllabusForm.reset();
    // list updates via subscription
  }

  onSelectSyllabus(syllabusId: string | null) {
    this.selectedSyllabusId = syllabusId;
    this.selectedChapterId = null;
    this.chapterList = [];

    if (this.selectedExamId && syllabusId) {
      this.chaptersSub?.unsubscribe();
      this.chaptersSub = this.svc.getChapters(this.selectedExamId, syllabusId).subscribe(list => {
        this.chapterList = list || [];
      });
    }
  }

  // ----------------- CHAPTER -----------------
  async createChapter() {
    if (!this.selectedExamId || !this.selectedSyllabusId) {
      alert('Select exam and syllabus first');
      return;
    }
    if (this.chapterForm.invalid) {
      this.chapterForm.markAllAsTouched();
      return;
    }
    const payload: Chapter = {
      examId: this.selectedExamId,
      syllabusId: this.selectedSyllabusId,
      name: this.chapterForm.value.name.trim(),
      imageUrl: this.chapterForm.value.imageUrl || undefined
    };
    await this.svc.createChapter(this.selectedExamId, this.selectedSyllabusId, payload);
    this.chapterForm.reset();
  }

  onSelectChapter(chapterId: string | null) {
    this.selectedChapterId = chapterId;
  }

  // ----------------- Single Question Save -----------------
  async saveSingleQuestion() {
    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      return;
    }
    const v = this.questionForm.value;
    const q: Question = {
      title: v.title,
      options: v.options,
      correctAnswer: v.correctAnswer,
      imageUrl: v.imageUrl || undefined,
      examId: this.selectedExamId || undefined,
      examName: this.exams.find(e => e.id === this.selectedExamId)?.name,
      syllabusId: this.selectedSyllabusId || undefined,
      syllabusName: this.syllabusList.find(s => s.id === this.selectedSyllabusId)?.name,
      chapterId: this.selectedChapterId || undefined,
      chapterName: this.chapterList.find(c => c.id === this.selectedChapterId)?.name
    };

    // save top-level
    await this.svc.createTopLevelQuestion(q);

    // also save under chapter (if selected)
    if (this.selectedExamId && this.selectedSyllabusId && this.selectedChapterId) {
      await this.svc.createQuestionUnderChapter(this.selectedExamId, this.selectedSyllabusId, this.selectedChapterId, q);
    }

    alert('Question saved.');
    this.resetQuestionForm();
  }

  private resetQuestionForm() {
    this.questionForm.reset({ title: '', options: ['', '', '', ''], correctAnswer: '', imageUrl: '' });
    // reinitialize options array controls
    const opts = this.options;
    while (opts.length) opts.removeAt(0);
    for (let i = 0; i < 4; i++) opts.push(this.fb.control('', Validators.required));
  }

  // ----------------- Bulk parsing and saving -----------------
  // Bulk format: multiple blocks separated by blank line:
  // QTitle
  // A) optionA
  // B) optionB
  // C) optionC
  // D) optionD
  // Answer: B
  private parseBulkText(input: string): Question[] {
    const blocks = input.trim().split(/\n\s*\n/);
    const questions: Question[] = [];

    for (const block of blocks) {
      const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 6) continue;
      const title = lines[0];
      // lines 1..4 are options
      const options = lines.slice(1, 5).map(l => l.replace(/^[A-D]\)\s*/i, '').trim());
      const ansLine = lines[5].replace(/^Answer:\s*/i, '').trim();
      // convert Answer "B" or "B)" or full text. We'll support both:
      let correct = ansLine;
      // if ansLine is single letter A/B/C/D -> map to option
      if (/^[A-D]$/i.test(correct)) {
        const idx = correct.toUpperCase().charCodeAt(0) - 65;
        correct = options[idx] || correct;
      } else if (/^[A-D]\)/i.test(correct)) {
        const letter = correct[0].toUpperCase();
        const idx = letter.charCodeAt(0) - 65;
        correct = options[idx] || correct;
      } // else assume it's exact option text

      questions.push({
        title,
        options,
        correctAnswer: correct,
      } as Question);
    }

    return questions;
  }

  async saveBulkQuestions() {
    const text = this.bulkForm.value.bulkText?.trim() || '';
    if (!text) { alert('Paste bulk questions in the text area'); return; }

    const parsed = this.parseBulkText(text);
    if (!parsed.length) { alert('No valid questions parsed. Check format'); return; }

    const savedIds: string[] = [];
    for (const q of parsed) {
      // attach hierarchy if selected
      q.examId = this.selectedExamId || undefined;
      q.examName = this.exams.find(e => e.id === this.selectedExamId)?.name;
      q.syllabusId = this.selectedSyllabusId || undefined;
      q.syllabusName = this.syllabusList.find(s => s.id === this.selectedSyllabusId)?.name;
      q.chapterId = this.selectedChapterId || undefined;
      q.chapterName = this.chapterList.find(c => c.id === this.selectedChapterId)?.name;

      const top = await this.svc.createTopLevelQuestion(q);
      // top is a Promise<DocumentReference>; addDoc returns DocumentReference. We can't easily get ID from it here without importing types,
      // but for simplicity we won't collect ids. If you want ids, replace with returned reference handling.
      if (this.selectedExamId && this.selectedSyllabusId && this.selectedChapterId) {
        await this.svc.createQuestionUnderChapter(this.selectedExamId, this.selectedSyllabusId, this.selectedChapterId, q);
      }
    }

    alert(`Saved ${parsed.length} questions.`);
    this.bulkForm.reset();
  }

  get selectedExamName() {
  return this.exams?.find(e => e.id === this.selectedExamId)?.name || '—';
}

get selectedSyllabusName() {
  return this.syllabusList?.find(s => s.id === this.selectedSyllabusId)?.name || '—';
}

get selectedChapterName() {
  return this.chapterList?.find(c => c.id === this.selectedChapterId)?.name || '—';
}

}

