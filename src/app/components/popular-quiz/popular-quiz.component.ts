import { Component, OnInit, inject } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { QuizService } from '../../quiz.service';
import { Question, PopularQuizSet } from '../../models';

@Component({
  selector: 'app-popular-quiz',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './popular-quiz.component.html',
  styleUrls: ['./popular-quiz.component.scss']
})
export class PopularQuizComponent implements OnInit {
  private svc = inject(QuizService);

  quizTitle = new FormControl('', Validators.required);
  questionIdsInput = new FormControl('', Validators.required);

  questions: Question[] = [];
  selectedQuestions: Set<string> = new Set();
  loadingQuestions = false;

  ngOnInit(): void {}

  async fetchQuestionsByIds() {
    const raw = this.questionIdsInput.value || '';
    const ids = raw.split(/[\n,]+/).map(id => id.trim()).filter(Boolean);

    if (ids.length === 0) {
      alert('Please enter at least one question ID.');
      return;
    }

    this.loadingQuestions = true;
    this.questions = await this.svc.getQuestionsByIds(ids);
    this.selectedQuestions.clear();
    this.loadingQuestions = false;

    if (this.questions.length === 0) {
      alert('No questions found for the provided IDs.');
    }
  }

  toggleQuestionSelection(id: string) {
    if (this.selectedQuestions.has(id)) this.selectedQuestions.delete(id);
    else this.selectedQuestions.add(id);
  }

  isSelected(id: string): boolean {
    return this.selectedQuestions.has(id);
  }

  selectAllQuestions() {
    this.questions.forEach(q => this.selectedQuestions.add(q.id!));
  }

  deselectAllQuestions() {
    this.selectedQuestions.clear();
  }

  async savePopularQuiz() {
    if (!this.quizTitle.value || this.selectedQuestions.size === 0) {
      alert('Please provide a title and select at least one question.');
      return;
    }

    const selectedQs = this.questions.filter(q => this.selectedQuestions.has(q.id!));

    // Auto-populate subject: pick the first one (or logic to handle multiple subjects)
    const subjects = Array.from(new Set(selectedQs.map(q => q.subject)));
    const subject = subjects.length === 1 ? subjects[0] : 'Mixed';

    // Auto-populate subCategories and examTags from all selected questions
    const subCategories = Array.from(new Set(selectedQs.flatMap(q => q.subCategories || [])));
    const examTags = Array.from(new Set(selectedQs.flatMap(q => q.examTags || [])));

    const payload: PopularQuizSet = {
      title: this.quizTitle.value,
      subject,
      questionIds: Array.from(this.selectedQuestions),
      subCategories,
      examTags,
      likes : "",
    };

    const key = await this.svc.addPopularQuizSet(payload);

    if (key) {
      alert('Popular quiz created successfully!');
      this.quizTitle.reset();
      this.questionIdsInput.reset();
      this.questions = [];
      this.selectedQuestions.clear();
    }
  }
}
