import { Component, inject } from '@angular/core';
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

import { QuizService } from '../quiz.service';
import { SingleQuiz } from '../models';

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
export class SingleQuizFormComponent {
  private fb = inject(FormBuilder);
  private svc = inject(QuizService);

  // Reactive form for single quiz
  quizForm: FormGroup;

  // bulk area
  bulkText = '';
  bulkSubject = '';
  bulkPreview: SingleQuiz[] = [];
  parsingError = '';

  // subject tags (predefined; you can change or add UI to add custom)
  subjects: string[] = ['History', 'Science', 'Math', 'Geography', 'General Knowledge'];

  constructor() {
    // build reactive form with a FormArray of 4 options
    this.quizForm = this.fb.group({
      question: ['', Validators.required],
      options: this.fb.array([
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required)
      ]),
      subject: ['', Validators.required]
    });
  }

  // getter for template
  get options(): FormArray {
    return this.quizForm.get('options') as FormArray;
  }

  // Add a single quiz (form)
  async addQuiz(): Promise<void> {
    if (this.quizForm.invalid) {
      this.quizForm.markAllAsTouched();
      return;
    }

    const v = this.quizForm.value;
    const payload: SingleQuiz = {
      title: v.question,
      options: [
        v.options[0] || '',
        v.options[1] || '',
        v.options[2] || '',
        v.options[3] || ''
      ],
      subject: v.subject || ''
    };

    try {
      await this.svc.addSingleQuiz(payload);
      // reset form & options
      this.quizForm.reset();
      this.options.clear();
      for (let i = 0; i < 4; i++) this.options.push(this.fb.control('', Validators.required));
      alert('Quiz added successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to add quiz. See console for details.');
    }
  }

  // Bulk parser: split into blocks (blank-line separated), extract question + options
  parseBulkText(): void {
    this.bulkPreview = [];
    this.parsingError = '';
    const raw = (this.bulkText || '').trim();
    if (!raw) {
      this.parsingError = 'No text provided.';
      return;
    }

    // split by one or more blank lines -> each block should be one question + its options
    const blocks: string[] = raw.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);

    for (const block of blocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 5) {
        // needs at least 1 question line + 4 option lines
        continue;
      }

      // first line -> question (strip leading numbering like "1. " if present)
      let questionLine = lines[0].replace(/^\d+\.\s*/, '').trim();

      const opts: string[] = [];

      // for each subsequent line, attempt to strip a leading option label like "a) ", "1) ", "i) ", "का) " etc.
      // regex: capture everything after "label)" or "label." (label = sequence of non-space chars)
      const optionRegex = /^\s*([^\s\)\.]+)[\)\.]\s*(.*)$/u;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const m = line.match(optionRegex);
        if (m && m[2] !== undefined && m[2].trim() !== '') {
          opts.push(m[2].trim());
        } else {
          // line didn't match label pattern — in some inputs options may not have labels, so treat the line as option text
          opts.push(line);
        }
      }

      // only accept blocks that provide at least 4 options; take first 4
      if (opts.length >= 4) {
        const quiz: SingleQuiz = {
          title: questionLine,
          options: [opts[0], opts[1], opts[2], opts[3]],
          subject: this.bulkSubject || ''
        };
        this.bulkPreview.push(quiz);
      }
    }

    if (this.bulkPreview.length === 0) {
      this.parsingError = 'No valid question blocks found. Ensure each question is followed by 4 option lines (labelled like a) / 1) / i) / ka) etc, or just 4 lines).';
    }
  }

  // remove a single preview item
  deletePreview(index: number): void {
    this.bulkPreview.splice(index, 1);
  }

  // clear all preview items & input
  clearAllPreview(): void {
    this.bulkPreview = [];
    this.bulkText = '';
    this.parsingError = '';
    this.bulkSubject = '';
  }

  // upload all previewed quizzes
  async uploadBulk(): Promise<void> {
    if (!this.bulkPreview.length) return;

    // ensure subject applied if chosen
    const finalList = this.bulkPreview.map(q => ({
      ...q,
      subject: this.bulkSubject || q.subject || ''
    }));

    try {
      // your service method (should exist)
      await this.svc.addMultipleSingleQuizzes(finalList);
      alert(`Uploaded ${finalList.length} quizzes.`);
      this.clearAllPreview();
    } catch (err) {
      console.error(err);
      alert('Failed to upload bulk quizzes. See console for details.');
    }
  }
}
