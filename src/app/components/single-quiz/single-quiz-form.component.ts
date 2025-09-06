import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';

import { QuizService } from '../../quiz.service';
import { SingleQuiz } from '../../models';

interface BulkPreviewQuiz extends SingleQuiz {
  missingAnswer?: boolean;
}

@Component({
  selector: 'app-single-quiz-form',
  standalone: true,
  templateUrl: './single-quiz-form.component.html',
  styleUrls: ['./single-quiz-form.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatListModule,
    MatTabsModule
  ]
})
export class SingleQuizFormComponent implements AfterViewInit, OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(QuizService);

  quizForm: FormGroup;
  subjects: string[] = [];

  bulkText = '';
  bulkSubject = '';
  bulkPreview: BulkPreviewQuiz[] = [];
  parsingError = '';

  fallbackAnswersText = '';

   

  constructor() {
    this.quizForm = this.fb.group({
      question: ['', Validators.required],
      options: this.fb.array([
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required)
      ]),
      subject: ['', Validators.required],
      correctAnswer: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSubjects();
  }

  ngAfterViewInit(): void {}

  async loadSubjects() {
    this.subjects = await this.svc.getSubjects();
  }

  get options(): FormArray {
    return this.quizForm.get('options') as FormArray;
  }

  get hasMissingAnswers(): boolean {
    return this.bulkPreview?.some(q => !q.correctAnswer) ?? false;
  }

  // ----------------- Single Quiz -----------------
  async addQuiz(): Promise<void> {
    if (this.quizForm.invalid) {
      this.quizForm.markAllAsTouched();
      return;
    }

    const v = this.quizForm.value;
    const options = (v.options as string[]).filter(opt => opt && opt.trim());
    if (!v.correctAnswer?.trim()) {
      alert('Correct answer is mandatory!');
      return;
    }

    const payload: SingleQuiz = {
      title: v.question,
      options: options,
      subject: v.subject || '',
      correctAnswer: v.correctAnswer.trim()
    };

    try {
      await this.svc.addSingleQuiz(payload);
      this.quizForm.reset();
      this.options.clear();
      for (let i = 0; i < 4; i++) this.options.push(this.fb.control('', Validators.required));
      alert('Quiz added successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to add quiz.');
    }
  }

  // ----------------- Bulk Parsing -----------------
 parseBulkText(fallbackAnswers: string[] = []): void {
  this.bulkPreview = [];
  this.parsingError = '';

  const raw = (this.bulkText || '').trim();
  if (!raw) {
    this.parsingError = 'No text provided.';
    return;
  }

  // Split questions by a number + dot (English or Hindi digits supported)
  const blocks = raw.split(/\n(?=(\d+|[०-९]+)\.)/).map(b => b.trim()).filter(Boolean);

  let questionIndex = 0;

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) continue;

    // First line = question
    const questionLine = lines[0].replace(/^(\d+|[०-९]+)\.\s*/, '').trim();

    const options: string[] = [];
    let correctAnswer: string | undefined;

    // --- UNIVERSAL OPTION REGEX ---
  const optionRegex = /^\s*(?:[A-Da-d]|\d{1,2}|[ivx]+|[IVXLCDM]+|[क-घ]|[०-९]+)[\.\)]?\s*(.+)$/u;


    const answerRegex = /^Answer\s*[:\-]?\s*(.*)$/i;

    for (const line of lines.slice(1)) {
      const oMatch = line.match(optionRegex);
      const aMatch = line.match(answerRegex);

      if (oMatch && oMatch[1].trim()) {
        options.push(oMatch[1].trim());
      } else if (aMatch) {
        correctAnswer = aMatch[1].trim();
      }
    }

    if (!correctAnswer && fallbackAnswers[questionIndex]) {
      correctAnswer = fallbackAnswers[questionIndex];
    }

    this.bulkPreview.push({
      title: questionLine,
      options: options.slice(0, 4),
      correctAnswer: correctAnswer || '',
      subject: this.bulkSubject || ''
    });

    questionIndex++;
  }

  if (this.bulkPreview.length === 0) {
    this.parsingError =
      'No valid question blocks found. Ensure each block starts with a number and contains options.';
  }
}




  deletePreview(index: number): void {
    this.bulkPreview.splice(index, 1);
  }

  clearAllPreview(): void {
    this.bulkPreview = [];
    this.bulkText = '';
    this.bulkSubject = '';
    this.parsingError = '';
    this.fallbackAnswersText = '';
  }

  // ----------------- Bulk Upload -----------------
  mapFallbackAnswers(): void {
    if (!this.fallbackAnswersText.trim()) return;
    const answers = this.fallbackAnswersText.split(/\r?\n/).map(a => a.trim());
    let idx = 0;
    this.bulkPreview.forEach(q => {
      if (!q.correctAnswer && answers[idx]) {
        q.correctAnswer = answers[idx];
        q.missingAnswer = false;
        idx++;
      }
    });
    this.fallbackAnswersText = '';
  }

  async uploadBulk(): Promise<void> {
    if (!this.bulkPreview.length) return;

    // check if any missing correct answers remain
    const missing = this.bulkPreview.filter(q => !q.correctAnswer);
    if (missing.length) {
      alert('Please provide all missing correct answers before uploading.');
      return;
    }

    const finalList = this.bulkPreview.map(q => ({
      ...q,
      subject: this.bulkSubject || q.subject || ''
    }));

    try {
      await this.svc.addMultipleSingleQuizzes(finalList);
      alert(`Uploaded ${finalList.length} quizzes.`);
      this.clearAllPreview();
    } catch (err) {
      console.error(err);
      alert('Failed to upload bulk quizzes.');
    }
  }
}
