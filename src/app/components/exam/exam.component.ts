import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule, NgModel, FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { QuizHierarchyService } from '../../quiz-hierarchy.service';
import { LanguageService } from '../../services/language.service';
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
import { LanguageSelectorComponent } from '../common/language-selector.component';
import { MatTabsModule } from '@angular/material/tabs';

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
    FormsModule,
    LanguageSelectorComponent,
    MatTabsModule
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
  languageSub?: Subscription;

  // forms
  examForm!: FormGroup;      // create exam
  syllabusForm!: FormGroup;  // create syllabus
  chapterForm!: FormGroup;   // create chapter
  questionForm!: FormGroup;  // single question (multi-language)
  bulkForm!: FormGroup;      // bulk paste

  // selection ids
  selectedExamId: string | null = null;
  selectedSyllabusId: string | null = null;
  selectedChapterId: string | null = null;

  // Multi-language support
  selectedLanguages: string[] = ['en'];
  currentLanguage: string = 'en';
  allLanguages: any[] = [];

  constructor(
    private fb: FormBuilder, 
    private svc: QuizHierarchyService,
    public languageService: LanguageService
  ) {}

  ngOnInit(): void {
    // Initialize language service
    this.allLanguages = this.languageService.getAvailableLanguages();
    this.languageSub = this.languageService.selectedLanguages$.subscribe(langs => {
      this.selectedLanguages = langs;
      // Reinitialize multi-language question form with selected languages
      this.initializeMultiLanguageQuestionForm();
    });

    this.languageService.currentLanguage$.subscribe(lang => {
      this.currentLanguage = lang;
    });

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

    // Initialize multi-language question form
    this.initializeMultiLanguageQuestionForm();

    this.bulkForm = this.fb.group({
      bulkText: ['']
    });

    // load exams (reactive)
    this.examsSub = this.svc.getExams().subscribe(list => {
      this.exams = list || [];
    });

    // watch selection changes? We'll use select handlers from template.
  }

  /**
   * Initialize question form with multi-language support
   */
  private initializeMultiLanguageQuestionForm(): void {
    // Create form with language-specific question, options, and answers
    const langs = this.selectedLanguages;
    
    const titleGroup: any = {};
    const optionsGroup: any = {};
    const answersGroup: any = {};

    langs.forEach(lang => {
      titleGroup[lang] = ['', Validators.required];
      answersGroup[lang] = ['', Validators.required];
      // 4 options per language
      optionsGroup[lang] = this.fb.array([
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required)
      ]);
    });

    this.questionForm = this.fb.group({
      titles: this.fb.group(titleGroup),
      optionsByLanguage: this.fb.group(optionsGroup),
      correctAnswers: this.fb.group(answersGroup),
      imageUrl: ['']
    });
  }

  /**
   * Get form array for options of a specific language
   */
  getOptionsForLanguage(language: string): FormArray {
    const optionsGroup = this.questionForm.get('optionsByLanguage') as FormGroup;
    return optionsGroup.get(language) as FormArray;
  }

  /**
   * Convert LocalizedContent or string to string for compatibility
   */
  private getNameAsString(value: any): string | undefined {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value['en']) return value['en'];
    return undefined;
  }

  /**
   * Get title control for a specific language
   */
  getTitleForLanguage(language: string) {
    return (this.questionForm.get('titles') as FormGroup).get(language);
  }

  /**
   * Get correct answer control for a specific language
   */
  getAnswerForLanguage(language: string) {
    return (this.questionForm.get('correctAnswers') as FormGroup).get(language);
  }

  ngOnDestroy(): void {
    this.examsSub?.unsubscribe();
    this.syllabusSub?.unsubscribe();
    this.chaptersSub?.unsubscribe();
    this.languageSub?.unsubscribe();
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

  // ----------------- Single Question Save (Multi-Language) -----------------
  async saveSingleQuestion() {
    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      alert('Please fill in all required fields for all selected languages');
      return;
    }

    const v = this.questionForm.value;
    
    // Build multi-language title and options
    const titles: { [key: string]: string } = {};
    const optionsByLang: { [key: string]: string[] } = {};
    const answers: { [key: string]: string } = {};

    this.selectedLanguages.forEach(lang => {
      titles[lang] = v.titles[lang]?.trim() || '';
      optionsByLang[lang] = v.optionsByLanguage[lang] || ['', '', '', ''];
      answers[lang] = v.correctAnswers[lang]?.trim() || '';
    });

    const q: Question = {
      title: titles,
      options: optionsByLang,
      correctAnswer: answers,
      imageUrl: v.imageUrl || undefined,
      languages: this.selectedLanguages,
      examId: this.selectedExamId || undefined,
      examName: this.getNameAsString(this.exams.find(e => e.id === this.selectedExamId)?.name),
      syllabusId: this.selectedSyllabusId || undefined,
      syllabusName: this.getNameAsString(this.syllabusList.find(s => s.id === this.selectedSyllabusId)?.name),
      chapterId: this.selectedChapterId || undefined,
      chapterName: this.getNameAsString(this.chapterList.find(c => c.id === this.selectedChapterId)?.name)
    };

    try {
      // save top-level
      await this.svc.createTopLevelQuestion(q);

      // also save under chapter (if selected)
      if (this.selectedExamId && this.selectedSyllabusId && this.selectedChapterId) {
        await this.svc.createQuestionUnderChapter(this.selectedExamId, this.selectedSyllabusId, this.selectedChapterId, q);
      }

      alert(`✅ Question saved in ${this.selectedLanguages.length} language(s): ${this.selectedLanguages.map(l => this.languageService.getLanguageName(l)).join(', ')}`);
      this.resetQuestionForm();
    } catch (error) {
      console.error('Error saving question:', error);
      alert('❌ Error saving question. Please try again.');
    }
  }

  private resetQuestionForm() {
    this.initializeMultiLanguageQuestionForm();
  }

  // ==================== BULK QUESTIONS (MULTI-LANGUAGE) ====================
  /**
   * Enhanced bulk upload supporting multi-language questions
   * Format 1 (Single language - legacy):
   *   Question title?
   *   A) Option A
   *   B) Option B
   *   C) Option C
   *   D) Option D
   *   Answer: B
   *
   * Format 2 (Multi-language):
   *   [LANG:en]
   *   Question in English?
   *   A) Option A
   *   B) Option B
   *   C) Option C
   *   D) Option D
   *   Answer: B
   *   [LANG:hi]
   *   अंग्रेजी में सवाल?
   *   A) विकल्प A
   *   B) विकल्प B
   *   C) विकल्प C
   *   D) विकल्प D
   *   Answer: B
   *
   *   [BLANK LINE - SEPARATES QUESTIONS]
   *
   *   [LANG:en]
   *   Next question?
   *   ...
   */

  async saveBulkQuestions() {
    const text = this.bulkForm.value.bulkText?.trim() || '';
    if (!text) { alert('Paste bulk questions in the text area'); return; }

    // Detect format based on content
    const isMultiLanguageFormat = text.includes('[LANG:');
    
    let parsed: Question[];
    if (isMultiLanguageFormat) {
      parsed = this.parseMultiLanguageBulkText(text);
    } else {
      // Legacy single-language format - convert to multi-language
      const legacyParsed = this.parseLegacyBulkText(text);
      parsed = legacyParsed.map(q => ({
        ...q,
        title: { [this.selectedLanguages[0] || 'en']: q.title as string },
        options: { [this.selectedLanguages[0] || 'en']: q.options as string[] },
        correctAnswer: { [this.selectedLanguages[0] || 'en']: q.correctAnswer as string },
        languages: this.selectedLanguages.length > 0 ? this.selectedLanguages : ['en']
      }));
    }

    if (!parsed.length) { alert('No valid questions parsed. Check format'); return; }

    try {
      const savedIds: string[] = [];
      for (const q of parsed) {
        // attach hierarchy if selected
        q.examId = this.selectedExamId || undefined;
        q.examName = this.getNameAsString(this.exams.find(e => e.id === this.selectedExamId)?.name);
        q.syllabusId = this.selectedSyllabusId || undefined;
        q.syllabusName = this.getNameAsString(this.syllabusList.find(s => s.id === this.selectedSyllabusId)?.name);
        q.chapterId = this.selectedChapterId || undefined;
        q.chapterName = this.getNameAsString(this.chapterList.find(c => c.id === this.selectedChapterId)?.name);

        const top = await this.svc.createTopLevelQuestion(q);
        savedIds.push((top as any).id);
        
        if (this.selectedExamId && this.selectedSyllabusId && this.selectedChapterId) {
          await this.svc.createQuestionUnderChapter(this.selectedExamId, this.selectedSyllabusId, this.selectedChapterId, q);
        }
      }

      const langCount = isMultiLanguageFormat ? (parsed[0]?.languages?.length || 1) : this.selectedLanguages.length;
      const langNames = isMultiLanguageFormat 
        ? (parsed[0]?.languages || ['en']).map(l => this.languageService.getLanguageName(l)).join(', ')
        : this.selectedLanguages.map(l => this.languageService.getLanguageName(l)).join(', ');

      alert(`✅ Imported ${parsed.length} question(s) in ${langCount} language(s): ${langNames}`);
      this.bulkForm.reset();
    } catch (error) {
      console.error('Error importing questions:', error);
      alert('❌ Error importing questions. Please check format and try again.');
    }
  }

  /**
   * Parse multi-language bulk text format
   */
  private parseMultiLanguageBulkText(input: string): Question[] {
    const questions: Question[] = [];
    const questionBlocks = input.split(/\n\s*\n(?=\[LANG:)/);

    for (const block of questionBlocks) {
      if (!block.trim()) continue;

      const languageBlocks: { [lang: string]: { title: string; options: string[]; correct: string } } = {};
      const langMatches = block.split(/\n(?=\[LANG:)/);

      for (const langBlock of langMatches) {
        const langMatch = langBlock.match(/\[LANG:(\w+)\]/);
        if (!langMatch) continue;

        const lang = langMatch[1];
        const content = langBlock.replace(/\[LANG:\w+\]\n?/, '').trim();
        const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

        if (lines.length < 6) continue;

        const title = lines[0];
        const options = lines.slice(1, 5).map(l => l.replace(/^[A-D]\)\s*/i, '').trim());
        const ansLine = lines[5].replace(/^Answer:\s*/i, '').trim();

        let correct = ansLine;
        if (/^[A-D]$/i.test(correct)) {
          const idx = correct.toUpperCase().charCodeAt(0) - 65;
          correct = options[idx] || correct;
        } else if (/^[A-D]\)/i.test(correct)) {
          const letter = correct[0].toUpperCase();
          const idx = letter.charCodeAt(0) - 65;
          correct = options[idx] || correct;
        }

        languageBlocks[lang] = { title, options, correct };
      }

      // Only add if we have at least one language
      if (Object.keys(languageBlocks).length > 0) {
        const titles: { [key: string]: string } = {};
        const optionsByLang: { [key: string]: string[] } = {};
        const answers: { [key: string]: string } = {};
        const langs: string[] = [];

        for (const [lang, data] of Object.entries(languageBlocks)) {
          titles[lang] = data.title;
          optionsByLang[lang] = data.options;
          answers[lang] = data.correct;
          langs.push(lang);
        }

        questions.push({
          title: titles,
          options: optionsByLang,
          correctAnswer: answers,
          languages: langs
        } as Question);
      }
    }

    return questions;
  }

  /**
   * Parse legacy single-language bulk text
   */
  private parseLegacyBulkText(input: string): Question[] {
    const blocks = input.trim().split(/\n\s*\n/);
    const questions: Question[] = [];

    for (const block of blocks) {
      const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 6) continue;
      const title = lines[0];
      const options = lines.slice(1, 5).map(l => l.replace(/^[A-D]\)\s*/i, '').trim());
      const ansLine = lines[5].replace(/^Answer:\s*/i, '').trim();

      let correct = ansLine;
      if (/^[A-D]$/i.test(correct)) {
        const idx = correct.toUpperCase().charCodeAt(0) - 65;
        correct = options[idx] || correct;
      } else if (/^[A-D]\)/i.test(correct)) {
        const letter = correct[0].toUpperCase();
        const idx = letter.charCodeAt(0) - 65;
        correct = options[idx] || correct;
      }

      questions.push({
        title,
        options,
        correctAnswer: correct,
      } as Question);
    }

    return questions;
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

