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

  // Regex to split by numbered questions (1., 2., Q1:, etc.)
  const questionRegex = /(\d+\.|Q\d+:)\s*/g;
  const questionParts = raw.split(questionRegex).filter(s => s.trim() !== '');

  let questionIndex = 0;

  for (let i = 0; i < questionParts.length; i += 2) {
    const numberPart = questionParts[i]; // e.g., "1." or "Q1:"
    const textPart = questionParts[i + 1]; // actual question + options + answer

    if (!textPart) continue;

    // Split options and answer
    const optionRegex = /([A-D1-4a-d][\)\.])\s*([^A-D1-4a-d][\)\.]?.*?)(?=(?:[A-D1-4a-d][\)\.]|Answer:|$))/g;
    const answerRegex = /Answer:\s*(.*)/i;

    const options: string[] = [];
    let correctAnswer: string | undefined;

    let match: RegExpExecArray | null;
    while ((match = optionRegex.exec(textPart)) !== null) {
      options.push(match[2].trim());
    }

    const answerMatch = textPart.match(answerRegex);
    if (answerMatch) {
      const ansText = answerMatch[1].trim();
      // try to map label to option text
      const label = ansText.split(')')[0].trim();
      const optionMatch = options.find(o =>
        o.toLowerCase().startsWith(label.toLowerCase()) ||
        o.toLowerCase().includes(ansText.split(')').slice(1).join(')').trim().toLowerCase())
      );
      correctAnswer = optionMatch || ansText;
    } else if (fallbackAnswers[questionIndex]) {
      correctAnswer = fallbackAnswers[questionIndex];
    }

    // Push to preview
    this.bulkPreview.push({
      title: textPart.split(/([A-D1-4a-d][\)\.])/)[0].trim(), // question text before first option
      options: options.slice(0, 4),
      correctAnswer: correctAnswer || '',
      subject: this.bulkSubject || ''
    });

    questionIndex++;
  }

  if (this.bulkPreview.length === 0) {
    this.parsingError =
      'No valid question blocks found. Ensure each question has at least 2 options and optionally an Answer line.';
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
