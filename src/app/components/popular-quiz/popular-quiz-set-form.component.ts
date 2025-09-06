import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuizService } from '../../quiz.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { PopularQuizSet, BulkPreviewPopularQuiz } from '../../models';

@Component({
  selector: 'app-popular-quiz-set-form',
  standalone: true,
  templateUrl: './popular-quiz-set-form.component.html',
  styleUrls: ['./popular-quiz-set-form.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule,
    MatTabsModule,
    MatListModule
  ]
})
export class PopularQuizSetFormComponent implements AfterViewInit, OnInit {
  saving = false;
  msg = '';
  form!: FormGroup;
  bulkText = '';
  bulkPreview: BulkPreviewPopularQuiz[] = [];
  showBulkPreview = false;
  parsingError = '';
  fallbackAnswersText = '';
  subjects: string[] = [];

  constructor(private fb: FormBuilder, private svc: QuizService) {}

  ngAfterViewInit(): void {
    this.loadSubjects();
  }

  ngOnInit() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      subject: ['', Validators.required],
      questions: this.fb.array<FormGroup>([])
    });
  }

  async loadSubjects() {
    this.subjects = await this.svc.getSubjects();
  }

  get questions(): FormArray<FormGroup> {
    return this.form.get('questions') as FormArray<FormGroup>;
  }

  addQuestion() {
    this.questions.push(
      this.fb.group({
        title: ['', Validators.required],
        options: this.fb.array([
          this.fb.control('', Validators.required),
          this.fb.control('', Validators.required),
          this.fb.control('', Validators.required),
          this.fb.control('', Validators.required)
        ])
      })
    );
  }

  removeQuestion(i: number) {
    this.questions.removeAt(i);
  }

  clearQuestions() {
    this.questions.clear();
  }

  get hasMissingAnswers(): boolean {
    return this.bulkPreview?.some(q => q.missingAnswer) ?? false;
  }

  onCorrectAnswerChange(index: number): void {
    const q = this.bulkPreview[index];
    if (q) {
      q.missingAnswer = !q.correctAnswer?.trim();
      // Trigger change detection
      this.bulkPreview = [...this.bulkPreview];
    }
  }

  parseBulkText(): void {
    this.bulkPreview = [];
    this.parsingError = '';

    const raw = (this.bulkText || '').trim();
    if (!raw) {
      this.parsingError = 'No text provided.';
      return;
    }

    const lines = raw.replace(/\r\n/g, '\n').split('\n');
    let currentQuestion = '';
    let currentOptions: string[] = [];
    let correctAnswer: string | null = null;

    const optionRegex = /^\s*([A-Da-d1-9ivxIVXLCDMक-घ०-९]+[\)\.])\s*(.+)$/u;
    const questionRegex = /^\s*(?:[\dQq]+[\.\:]|)(.+)$/;
    const answerRegex = /^Answer[:\-]?\s*(.*)$/i;

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      const aMatch = line.match(answerRegex);
      const oMatch = line.match(optionRegex);
      const qMatch = (!oMatch && line) ? line.match(questionRegex) : null;

      if (qMatch && !currentQuestion) {
        currentQuestion = qMatch[1].trim();
        currentOptions = [];
        correctAnswer = null;
      } else if (qMatch && currentQuestion) {
        if (currentOptions.length >= 2) {
          this.bulkPreview.push({
            title: currentQuestion,
            options: currentOptions.slice(0, 4),
            correctAnswer: correctAnswer || '',
            subject: this.form.value.subject || '',
            missingAnswer: !correctAnswer
          });
        }
        currentQuestion = qMatch[1].trim();
        currentOptions = [];
        correctAnswer = null;
      } else if (aMatch) {
        correctAnswer = aMatch[1].trim();
      } else if (oMatch) {
        const optText = oMatch[2].trim();
        if (optText) currentOptions.push(optText);
      } else {
        currentOptions.push(line);
      }
    }

    if (currentQuestion && currentOptions.length >= 2) {
      this.bulkPreview.push({
        title: currentQuestion,
        options: currentOptions.slice(0, 4),
        correctAnswer: correctAnswer || '',
        subject: this.form.value.subject || '',
        missingAnswer: !correctAnswer
      });
    }

    if (this.bulkPreview.length === 0) {
      this.parsingError = 'No valid question blocks found. Ensure each question has at least 2 options and optionally an Answer line.';
    } else {
      this.showBulkPreview = true;
    }
  }

  removeBulkQuestion(i: number) {
    this.bulkPreview.splice(i, 1);
  }

  clearBulkPreview() {
    this.bulkPreview = [];
    this.showBulkPreview = false;
  }

  mapFallbackAnswers(): void {
    if (!this.fallbackAnswersText.trim()) return;
    const answers = this.fallbackAnswersText.split(/\r?\n/).map(a => a.trim());
    let idx = 0;
    this.bulkPreview.forEach(q => {
      if (q.missingAnswer && answers[idx]) {
        q.correctAnswer = answers[idx];
        q.missingAnswer = false;
        idx++;
      }
    });
    this.fallbackAnswersText = '';
    this.bulkPreview = [...this.bulkPreview];
  }

  async saveFormQuiz() {
    if (this.form.invalid || this.questions.length === 0) return;
    this.saving = true;
    this.msg = '';
    const raw = this.form.value;

    try {
      const questionsPayload = this.questions.value.map((q: any) => ({
        title: q.title!,
        options: (q.options as string[]).filter(Boolean),
        correctAnswer: q.correctAnswer?.trim() || ''
      }));

      await this.svc.addPopularQuizSet({
        title: raw.title!,
        questions: questionsPayload,
        subject: raw.subject!
      });

      this.msg = 'Saved!';
      this.form.reset();
      this.clearQuestions();
    } catch (e: any) {
      this.msg = e?.message || 'Error';
    } finally {
      this.saving = false;
    }
  }

  async saveBulkQuiz() {
    if (!this.bulkPreview.length) return;
    if (this.hasMissingAnswers) {
      alert('Please provide all missing correct answers before saving.');
      return;
    }
    this.saving = true;
    this.msg = '';

    try {
      const setData: PopularQuizSet = {
        title: this.form.value.title?.trim() || 'Bulk Quiz',
        subject: this.form.value.subject?.trim() || 'General',
        questions: this.bulkPreview.map(q => ({
          title: q.title,
          options: q.options.filter(Boolean),
          correctAnswer: q.correctAnswer.trim()
        }))
      };

      await this.svc.addPopularQuizSet(setData);

      this.msg = 'Bulk Quiz Set Saved!';
      this.bulkText = '';
      this.clearBulkPreview();
    } catch (e: any) {
      this.msg = e?.message || 'Error';
    } finally {
      this.saving = false;
    }
  }
}
