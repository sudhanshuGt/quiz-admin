import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuizService } from '../quiz.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { PopularQuizSet} from '../models';

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
export class PopularQuizSetFormComponent implements OnInit {
  saving = false;
  msg = '';
  form!: FormGroup;
  bulkText = '';
  bulkPreview: any[] = [];
  showBulkPreview = false;
  parsingError = '';

  subjects = ['Math', 'Science', 'History', 'Geography', 'English'];

  constructor(private fb: FormBuilder, private svc: QuizService) {}

  ngOnInit() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      subject: ['', Validators.required],
      questions: this.fb.array<FormGroup>([])
    });
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

 parseBulkText(): void {
  this.bulkPreview = [];
  this.parsingError = '';

  const raw = (this.bulkText || '').trim();
  if (!raw) {
    this.parsingError = 'No text provided.';
    return;
  }

  // Split by one or more blank lines -> each block is a question + options
  const blocks = raw.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 5) continue; // 1 question + at least 4 options

    // Strip numbering from question line (like "1. ", "Q1: ", etc.)
    const questionLine = lines[0].replace(/^\s*[\dQq]+[\.\:]\s*/, '').trim();

    const opts: string[] = [];
    const optionRegex = /^\s*([^\s\)\.]+)[\)\.]\s*(.*)$/u;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const m = line.match(optionRegex);
      if (m && m[2].trim()) {
        opts.push(m[2].trim());
      } else {
        opts.push(line); // fallback: treat whole line as option text
      }
    }

    if (opts.length >= 4) {
      this.bulkPreview.push({
        title: questionLine,
        options: [opts[0], opts[1], opts[2], opts[3]],
        subject: this.subjects || ''
      });
    }
  }

  if (this.bulkPreview.length === 0) {
    this.parsingError =
      'No valid question blocks found. Each question must have 4 option lines (labels optional: a), 1), i), ka), etc).';
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

  async saveFormQuiz() {
    if (this.form.invalid || this.questions.length === 0) return;
    this.saving = true; this.msg = '';
    const raw = this.form.value;
    try {
      await this.svc.addPopularQuizSet({
        title: raw.title!,
        questions: this.questions.value.map(q => ({
          title: q.title!,
          options: q.options as [string, string, string, string]
        })),
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
    this.saving = true; this.msg = '';
    try {
      const setData: PopularQuizSet = {
        title: this.form.value.title?.trim() || 'Bulk Quiz',
        subject: this.form.value.subject?.trim() || 'General',
        questions: this.bulkPreview.map((q, i) => ({
          title: q.title,
          options: q.options as [string, string, string, string]
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
