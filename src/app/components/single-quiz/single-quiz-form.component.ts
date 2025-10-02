import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent, MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, map, startWith } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';

import { QuizService } from '../../quiz.service';
import { Question } from '../../models';
import { BulkIdsDialogComponent } from '../common/BulkIdsDialogComponent';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-single-quiz-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule
  ],
  templateUrl: './single-quiz-form.component.html',
  styleUrls: ['./single-quiz-form.component.css']
})
export class SingleQuizFormComponent implements OnInit {

  dialog = inject(MatDialog);
  fb = inject(FormBuilder);
  svc = inject(QuizService);

  quizForm!: FormGroup;

  subjects: string[] = [];
  allSubCategories: string[] = [];
  allExamTags: string[] = [];
  allClasses: string[] = [];

  subCategories: string[] = [];
  examTags: string[] = [];
  classTags: string[] = [];

  subCtrl = new FormControl('');
  tagCtrl = new FormControl('');
  classCtrl = new FormControl('');
  levelCtrl = new FormControl('');

  bulkCtrl = new FormControl('');
  bulkSubject = new FormControl('', Validators.required);
  bulkSubCategories: string[] = [];
  bulkExamTags: string[] = []; 
  bulkSubCtrl = new FormControl('');
  bulkTagCtrl = new FormControl('');
  bulkClassCtrl = new FormControl(''); 

  filteredBulkSubCategories!: Observable<string[]>;
  filteredBulkExamTags!: Observable<string[]>;
  filteredBulkClasses!: Observable<string[]>;

  filteredSubCategories!: Observable<string[]>;
  filteredExamTags!: Observable<string[]>;
  filteredClasses!: Observable<string[]>;

  bulkLevels: string[] = [];
bulkClasses: string[] = [];

bulkLevelCtrl = new FormControl(''); 

allLevels: string[] = ['Easy', 'Medium', 'Hard']; // you can make this dynamic if needed
allClassesBulk: string[] = [];
filteredBulkLevels!: Observable<string[]>; 



  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  @ViewChild('subInput') subInput!: ElementRef<HTMLInputElement>;
  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    this.quizForm = this.fb.group({
      question: ['', Validators.required],
      options: this.fb.array([
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required)
      ]),
      correctAnswer: ['', Validators.required],
      subject: ['', Validators.required],
      subCategories: [[]],
      examTags: [[]],
      classTags: [[]],
      level: ['']
    });

    this.loadGlobalLists();
    this.setupFilters();
    this.setupBulkFilters();
  }

  get options(): FormArray {
    return this.quizForm.get('options') as FormArray;
  }

  async loadGlobalLists() {
    this.subjects = await this.svc.getSubjects();
    this.allSubCategories = await this.svc.getSubCategories();
    this.allExamTags = await this.svc.getExamTags();
    this.allClasses = await this.svc.getClasses?.() || [];
  }

  setupFilters() {
    this.filteredSubCategories = this.subCtrl.valueChanges.pipe(
      startWith(''),
      map(value => this.allSubCategories.filter(sub => !this.subCategories.includes(sub) && sub.toLowerCase().includes((value || '').toLowerCase())))
    );

    this.filteredExamTags = this.tagCtrl.valueChanges.pipe(
      startWith(''),
      map(value => this.allExamTags.filter(tag => !this.examTags.includes(tag) && tag.toLowerCase().includes((value || '').toLowerCase())))
    );

    this.filteredClasses = this.classCtrl.valueChanges.pipe(
      startWith(''),
      map(value => this.allClasses.filter(cls => !this.classTags.includes(cls) && cls.toLowerCase().includes((value || '').toLowerCase())))
    );
  }

 setupBulkFilters() {
  this.filteredBulkSubCategories = this.bulkSubCtrl.valueChanges.pipe(
    startWith(''),
    map(value =>
      this.allSubCategories.filter(
        sub =>
          !this.bulkSubCategories.includes(sub) &&
          sub.toLowerCase().includes((value || '').toLowerCase())
      )
    )
  );

  this.filteredBulkExamTags = this.bulkTagCtrl.valueChanges.pipe(
    startWith(''),
    map(value =>
      this.allExamTags.filter(
        tag =>
          !this.bulkExamTags.includes(tag) &&
          tag.toLowerCase().includes((value || '').toLowerCase())
      )
    )
  );

  this.filteredBulkLevels = this.bulkLevelCtrl.valueChanges.pipe(
    startWith(''),
    map(value => 
      this.allLevels.filter(level => !this.bulkLevels.includes(level) && level.toLowerCase().includes((value || '').toLowerCase()))
    )
  );

  this.filteredBulkClasses = this.bulkClassCtrl.valueChanges.pipe(
    startWith(''),
    map(value => 
      this.allClasses.filter(cls => !this.bulkClasses.includes(cls) && cls.toLowerCase().includes((value || '').toLowerCase()))
    )
  );
}


addBulkLevel(event: MatChipInputEvent) {
  const value = (event.value || '').trim();
  if (value && !this.bulkLevels.includes(value)) this.bulkLevels.push(value);
  event.chipInput?.clear();
  this.bulkLevelCtrl.setValue('');
}

selectBulkLevel(event: MatAutocompleteSelectedEvent) {
  const value = event.option.value;
  if (!this.bulkLevels.includes(value)) this.bulkLevels.push(value);
  this.bulkLevelCtrl.setValue('');
}

removeBulkLevel(level: string) {
  this.bulkLevels = this.bulkLevels.filter(l => l !== level);
}

addBulkClass(event: MatChipInputEvent) {
  const value = (event.value || '').trim();
  if (value && !this.bulkClasses.includes(value)) this.bulkClasses.push(value);
  event.chipInput?.clear();
  this.bulkClassCtrl.setValue('');
}

selectBulkClass(event: MatAutocompleteSelectedEvent) {
  const value = event.option.value;
  if (!this.bulkClasses.includes(value)) this.bulkClasses.push(value);
  this.bulkClassCtrl.setValue('');
}

removeBulkClass(cls: string) {
  this.bulkClasses = this.bulkClasses.filter(c => c !== cls);
}



  // --- Single Quiz Tags ---
  addSubCategory(event: MatChipInputEvent) {
    const value = (event.value || '').trim();
    if (value && !this.subCategories.includes(value)) this.subCategories.push(value);
    event.chipInput?.clear();
    this.subCtrl.setValue('');
    this.updateForm();
  }

  selectSubCategory(event: MatAutocompleteSelectedEvent) {
    const value = event.option.value;
    if (!this.subCategories.includes(value)) this.subCategories.push(value);
    this.subInput.nativeElement.value = '';
    this.subCtrl.setValue('');
    this.updateForm();
  }

  removeSubCategory(sub: string) {
    this.subCategories = this.subCategories.filter(s => s !== sub);
    this.updateForm();
  }

  addExamTag(event: MatChipInputEvent) {
    const value = (event.value || '').trim();
    if (value && !this.examTags.includes(value)) this.examTags.push(value);
    event.chipInput?.clear();
    this.tagCtrl.setValue('');
    this.updateForm();
  }

  selectExamTag(event: MatAutocompleteSelectedEvent) {
    const value = event.option.value;
    if (!this.examTags.includes(value)) this.examTags.push(value);
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue('');
    this.updateForm();
  }

  removeExamTag(tag: string) {
    this.examTags = this.examTags.filter(t => t !== tag);
    this.updateForm();
  }

  addClassTag(event: MatChipInputEvent) {
    const value = (event.value || '').trim();
    if (value && !this.classTags.includes(value)) this.classTags.push(value);
    event.chipInput?.clear();
    this.classCtrl.setValue('');
    this.updateForm();
  }

  selectClassTag(event: MatAutocompleteSelectedEvent) {
    const value = event.option.value;
    if (!this.classTags.includes(value)) this.classTags.push(value);
    this.classCtrl.setValue('');
    this.updateForm();
  }

  removeClassTag(tag: string) {
    this.classTags = this.classTags.filter(t => t !== tag);
    this.updateForm();
  }

  private updateForm() {
    this.quizForm.patchValue({
      subCategories: this.subCategories,
      examTags: this.examTags,
      classTags: this.classTags
    });
  }

  // --- Bulk Quiz ---
  addBulkSubCategory(event: MatChipInputEvent) {
    const value = (event.value || '').trim();
    if (value && !this.bulkSubCategories.includes(value)) this.bulkSubCategories.push(value);
    event.chipInput?.clear();
    this.bulkSubCtrl.setValue('');
  }

  selectBulkSubCategory(event: MatAutocompleteSelectedEvent) {
    const value = event.option.value;
    if (!this.bulkSubCategories.includes(value)) this.bulkSubCategories.push(value);
    this.bulkSubCtrl.setValue('');
  }

  removeBulkSubCategory(sub: string) {
    this.bulkSubCategories = this.bulkSubCategories.filter(s => s !== sub);
  }

  addBulkExamTag(event: MatChipInputEvent) {
    const value = (event.value || '').trim();
    if (value && !this.bulkExamTags.includes(value)) this.bulkExamTags.push(value);
    event.chipInput?.clear();
    this.bulkTagCtrl.setValue('');
  }

  selectBulkExamTag(event: MatAutocompleteSelectedEvent) {
    const value = event.option.value;
    if (!this.bulkExamTags.includes(value)) this.bulkExamTags.push(value);
    this.bulkTagCtrl.setValue('');
  }

  removeBulkExamTag(tag: string) {
    this.bulkExamTags = this.bulkExamTags.filter(t => t !== tag);
  }

  addBulkClassTag(event: MatChipInputEvent) {
    const value = (event.value || '').trim();
    if (value && !this.bulkClasses.includes(value)) this.bulkClasses.push(value);
    event.chipInput?.clear();
    this.bulkClassCtrl.setValue('');
  }

  selectBulkClassTag(event: MatAutocompleteSelectedEvent) {
    const value = event.option.value;
    if (!this.bulkClasses.includes(value)) this.bulkClasses.push(value);
    this.bulkClassCtrl.setValue('');
  }

  removeBulkClassTag(tag: string) {
    this.bulkClasses = this.bulkClasses.filter(t => t !== tag);
  }

  async parseAndUploadBulk() {
    const text = this.bulkCtrl.value?.trim() || '';
    if (!text) {
      alert('Please paste questions first!');
      return;
    }

    if (!this.bulkSubject.value) {
      alert('Please select a subject for bulk questions!');
      return;
    }

    const questions = this.parseBulkText(text);
    if (!questions.length) {
      alert('No valid questions found!');
      return;
    }

    const uploadedIds: string[] = [];

    for (const q of questions) {
      const id = await this.svc.addQuestion({
        ...q,
        subject: this.bulkSubject.value,
        subCategories: this.bulkSubCategories,
        examTags: this.bulkExamTags, 
         classTags: this.bulkClasses,
        level: this.bulkLevelCtrl.value || 'Easy', 
      });
      if (id) uploadedIds.push(id);
    }

    // Reset form
    this.bulkCtrl.reset();
    this.bulkSubject.reset();
    this.bulkSubCategories = [];
    this.bulkExamTags = [];
    this.bulkClasses = []; 
    this.bulkClassCtrl.setValue('');
    this.bulkLevelCtrl.reset();

    // Open dialog with IDs
    this.dialog.open(BulkIdsDialogComponent, {
      width: '400px',
      data: { ids: uploadedIds }
    });
  }

  private parseBulkText(input: string): Question[] {
    const blocks = input.trim().split(/\n\s*\n/);
    const questions: Question[] = [];

    for (const block of blocks) {
      const lines = block.trim().split('\n');
      if (lines.length < 6) continue;

      const title = lines[0].trim();
      const options = lines.slice(1, 5).map(l => l.replace(/^[A-D]\)\s*/, '').trim());
      const correctAnswer = lines[5].trim().replace(/^Answer:\s*/, '');

      questions.push({
        title,
        options,
        correctAnswer,
        subject: 'General Knowledge',
        subCategories: [],
        examTags: [],
        classTags: [],
        level: 'Easy'
      });
    }

    return questions;
  }

  async addQuiz() {
  if (this.quizForm.invalid) {
    this.quizForm.markAllAsTouched();
    return;
  }

  const v = this.quizForm.value;

  const payload: Question = {
    title: v.question,
    options: v.options,
    correctAnswer: v.correctAnswer,
    subject: v.subject,
    subCategories: this.subCategories,
    examTags: this.examTags,
    classTags: this.classTags,
    level: this.levelCtrl.value || 'Easy'
  };

  await this.svc.addQuestion(payload);

  alert('Quiz added successfully!');

  this.quizForm.reset();
  this.subCategories = [];
  this.examTags = [];
  this.classTags = [];
  this.subCtrl.setValue('');
  this.tagCtrl.setValue('');
  this.classCtrl.setValue('');
  this.levelCtrl.reset();
  await this.loadGlobalLists();
}
}