# 💻 Multi-Language Implementation - Code Examples

## Table of Contents
1. [Using the Language Service](#using-the-language-service)
2. [Integrating in Components](#integrating-in-components)
3. [Working with Multi-Language Data](#working-with-multi-language-data)
4. [Service Methods](#service-methods)
5. [Form Patterns](#form-patterns)

---

## Using the Language Service

### Inject the Service
```typescript
import { LanguageService } from '../../services/language.service';

export class MyComponent {
  constructor(private languageService: LanguageService) {}
}
```

### Set Selected Languages
```typescript
// Set languages for quiz
this.languageService.setSelectedLanguages(['en', 'hi', 'es']);

// Verify
const selected = this.languageService.getSelectedLanguages(); // ['en', 'hi', 'es']
```

### Get Language Metadata
```typescript
// Get language name
const name = this.languageService.getLanguageName('hi'); // "हिंदी"

// Get language flag
const flag = this.languageService.getLanguageFlag('en'); // "🇬🇧"

// Get all language info
const info = this.languageService.getSelectedLanguageInfo();
// [
//   { code: 'en', name: 'English', flag: '🇬🇧' },
//   { code: 'hi', name: 'हिंदी', flag: '🇮🇳' }
// ]
```

---

## Integrating in Components

### Basic Setup
```typescript
import { LanguageSelectorComponent } from '../common/language-selector.component';

@Component({
  selector: 'app-my-component',
  imports: [
    CommonModule,
    LanguageSelectorComponent,  // ← Add this
    // ... other imports
  ]
})
export class MyComponent implements OnInit {
  selectedLanguages: string[] = [];

  constructor(private languageService: LanguageService) {}

  ngOnInit() {
    // Subscribe to language changes
    this.languageService.selectedLanguages$.subscribe(langs => {
      this.selectedLanguages = langs;
      this.reinitializeForm(); // Update form with new languages
    });
  }
}
```

### In Template
```html
<!-- Add language selector -->
<app-language-selector></app-language-selector>

<!-- Use selected languages -->
<mat-tab-group>
  <mat-tab *ngFor="let lang of selectedLanguages" 
            [label]="languageService.getLanguageFlag(lang)">
    <!-- Content here -->
  </mat-tab>
</mat-tab-group>
```

---

## Working with Multi-Language Data

### Creating Multi-Language Question
```typescript
const question: Question = {
  title: {
    'en': 'What is the capital of India?',
    'hi': 'भारत की राजधानी क्या है?'
  },
  options: {
    'en': ['New Delhi', 'Mumbai', 'Kolkata', 'Bangalore'],
    'hi': ['नई दिल्ली', 'मुंबई', 'कोलकाता', 'बेंगलुरु']
  },
  correctAnswer: {
    'en': 'New Delhi',
    'hi': 'नई दिल्ली'
  },
  languages: ['en', 'hi']
};
```

### Reading Multi-Language Data
```typescript
// Get title in specific language
function getTitleInLanguage(question: Question, lang: string): string {
  if (typeof question.title === 'string') {
    return question.title; // Legacy format
  }
  return question.title[lang] || '';
}

// Get all options in a language
function getOptionsInLanguage(question: Question, lang: string): string[] {
  if (Array.isArray(question.options)) {
    return question.options; // Legacy format
  }
  return question.options[lang] || [];
}

// Usage
const titleEn = getTitleInLanguage(question, 'en');
const titleHi = getTitleInLanguage(question, 'hi');
```

### Converting Between Formats
```typescript
// Convert legacy single-language to multi-language
function convertToMultiLanguage(oldQuestion: any, defaultLang: string = 'en'): Question {
  return {
    ...oldQuestion,
    title: { [defaultLang]: oldQuestion.title },
    options: { [defaultLang]: oldQuestion.options },
    correctAnswer: { [defaultLang]: oldQuestion.correctAnswer },
    languages: [defaultLang]
  };
}

// Usage
const legacyQ = { title: 'Question?', options: ['A','B','C','D'], correctAnswer: 'A' };
const modernQ = convertToMultiLanguage(legacyQ);
```

---

## Service Methods

### Core Methods

#### `setSelectedLanguages(languages: string[])`
```typescript
// Set which languages to use
this.languageService.setSelectedLanguages(['en', 'hi', 'es']);
// Auto-saves to localStorage
```

#### `getSelectedLanguages(): string[]`
```typescript
// Get current selected languages
const langs = this.languageService.getSelectedLanguages();
console.log(langs); // ['en', 'hi', 'es']
```

#### `setCurrentLanguage(code: string)`
```typescript
// Set the active/displayed language
this.languageService.setCurrentLanguage('hi');
```

#### `getCurrentLanguage(): string`
```typescript
// Get currently active language
const current = this.languageService.getCurrentLanguage();
console.log(current); // 'hi'
```

#### `getAvailableLanguages()`
```typescript
// Get all 8 supported languages
const all = this.languageService.getAvailableLanguages();
// [
//   { code: 'en', name: 'English', flag: '🇬🇧' },
//   { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
//   ...
// ]
```

#### `isLanguageSupported(code: string): boolean`
```typescript
this.languageService.isLanguageSupported('hi'); // true
this.languageService.isLanguageSupported('jp'); // false
```

#### `getLanguageName(code: string): string`
```typescript
this.languageService.getLanguageName('hi'); // "हिंदी"
```

#### `getLanguageFlag(code: string): string`
```typescript
this.languageService.getLanguageFlag('en'); // "🇬🇧"
```

### Observable Methods

#### `selectedLanguages$: Observable<string[]>`
```typescript
// Subscribe to language selection changes
this.languageService.selectedLanguages$.subscribe(langs => {
  console.log('Languages changed to:', langs);
  this.updateForm(langs);
});
```

#### `currentLanguage$: Observable<string>`
```typescript
// Subscribe to active language changes
this.languageService.currentLanguage$.subscribe(lang => {
  console.log('Current language:', lang);
  this.switchTab(lang);
});
```

### Configuration Methods

#### `exportLanguageConfig()`
```typescript
// Get current language configuration
const config = this.languageService.exportLanguageConfig();
// { languages: ['en', 'hi'], current: 'en' }

// Save to JSON
localStorage.setItem('languageConfig', JSON.stringify(config));
```

#### `importLanguageConfig(config)`
```typescript
// Import language configuration
const config = JSON.parse(localStorage.getItem('languageConfig'));
this.languageService.importLanguageConfig(config);
// Restores languages and active language
```

---

## Form Patterns

### Initialize Multi-Language Form
```typescript
private initializeMultiLanguageForm(languages: string[]): void {
  const titleGroup: any = {};
  const optionsGroup: any = {};

  languages.forEach(lang => {
    // Create title control for each language
    titleGroup[lang] = this.fb.control('', Validators.required);

    // Create options array for each language
    optionsGroup[lang] = this.fb.array([
      this.fb.control('', Validators.required),
      this.fb.control('', Validators.required),
      this.fb.control('', Validators.required),
      this.fb.control('', Validators.required)
    ]);
  });

  this.myForm = this.fb.group({
    titles: this.fb.group(titleGroup),
    options: this.fb.group(optionsGroup)
  });
}
```

### Handle Language Tab Switching
```typescript
onLanguageTabChange(lang: string): void {
  this.languageService.setCurrentLanguage(lang);
  
  // Optional: Save partial form state
  this.saveFormState(lang);
}
```

### Get Form Controls for Language
```typescript
getTitleControl(language: string) {
  return (this.myForm.get('titles') as FormGroup).get(language);
}

getOptionsForLanguage(language: string): FormArray {
  return (this.myForm.get('options') as FormGroup).get(language) as FormArray;
}
```

### Validate All Languages
```typescript
validateAllLanguages(): boolean {
  const languages = this.languageService.getSelectedLanguages();
  
  for (const lang of languages) {
    const titleControl = this.getTitleControl(lang);
    if (!titleControl || titleControl.invalid) {
      console.error(`${lang} title is invalid`);
      return false;
    }
  }
  
  return true;
}
```

### Collect Multi-Language Data
```typescript
collectMultiLanguageData(): Question {
  const languages = this.languageService.getSelectedLanguages();
  const formValue = this.myForm.value;

  const titles: { [key: string]: string } = {};
  const options: { [key: string]: string[] } = {};

  languages.forEach(lang => {
    titles[lang] = formValue.titles[lang];
    options[lang] = formValue.options[lang];
  });

  return {
    title: titles,
    options: options,
    languages: languages,
    // ... other fields
  };
}
```

---

## Real-World Example: Multi-Language Quiz Component

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LanguageService } from '../../services/language.service';
import { LanguageSelectorComponent } from '../common/language-selector.component';

@Component({
  selector: 'app-quiz-editor',
  imports: [LanguageSelectorComponent, ReactiveFormsModule, CommonModule],
  template: `
    <!-- Language Selector -->
    <app-language-selector></app-language-selector>

    <!-- Question Form -->
    <form [formGroup]="questionForm">
      <!-- Tab Group for Languages -->
      <mat-tab-group>
        <mat-tab *ngFor="let lang of selectedLanguages">
          <ng-template mat-tab-label>
            {{ languageService.getLanguageFlag(lang) }}
            {{ languageService.getLanguageName(lang) }}
          </ng-template>

          <!-- Question Input -->
          <mat-form-field>
            <mat-label>Question</mat-label>
            <input matInput [formControl]="getTitleControl(lang)" />
          </mat-form-field>

          <!-- Options Input -->
          <div [formGroup]="getOptionsGroup(lang)">
            <mat-form-field *ngFor="let i of [0,1,2,3]">
              <input matInput [formControl]="getOptionControl(lang, i)" />
            </mat-form-field>
          </div>
        </mat-tab>
      </mat-tab-group>

      <!-- Save Button -->
      <button (click)="saveQuestion()" [disabled]="!questionForm.valid">
        Save Question
      </button>
    </form>
  `
})
export class QuizEditorComponent implements OnInit {
  selectedLanguages: string[] = [];
  questionForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public languageService: LanguageService
  ) {}

  ngOnInit() {
    // Subscribe to language changes
    this.languageService.selectedLanguages$.subscribe(langs => {
      this.selectedLanguages = langs;
      this.initializeForm();
    });
  }

  private initializeForm(): void {
    const titleGroup: any = {};
    const optionsGroup: any = {};

    this.selectedLanguages.forEach(lang => {
      titleGroup[lang] = ['', Validators.required];
      optionsGroup[lang] = this.fb.group({
        option0: ['', Validators.required],
        option1: ['', Validators.required],
        option2: ['', Validators.required],
        option3: ['', Validators.required]
      });
    });

    this.questionForm = this.fb.group({
      titles: this.fb.group(titleGroup),
      options: this.fb.group(optionsGroup)
    });
  }

  getTitleControl(lang: string) {
    return (this.questionForm.get('titles') as any).get(lang);
  }

  getOptionsGroup(lang: string) {
    return (this.questionForm.get('options') as any).get(lang);
  }

  getOptionControl(lang: string, index: number) {
    return (this.questionForm.get('options') as any)
      .get(lang)
      .get(`option${index}`);
  }

  saveQuestion(): void {
    if (!this.questionForm.valid) return;

    // Collect data
    const question = {
      title: this.questionForm.get('titles')?.value,
      options: this.questionForm.get('options')?.value,
      languages: this.selectedLanguages
    };

    // Save to backend
    console.log('Saving:', question);
  }
}
```

---

## Best Practices

### Do ✅
- Keep service logic centralized
- Use observables for state changes
- Validate per language
- Save user preferences automatically
- Use type definitions (LocalizedContent)

### Don't ❌
- Mutate language arrays directly
- Access private service properties
- Skip form validation
- Mix language codes in UI display
- Hardcode language lists

---

## Performance Tips

1. **Use OnPush Change Detection**
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

2. **Unsubscribe from Observables**
```typescript
languageSub = this.languageService.selectedLanguages$
  .pipe(takeUntil(this.destroy$))
  .subscribe(...);
```

3. **Lazy Load Language Data**
```typescript
getLanguageData(lang: string) {
  return this.cache[lang] || this.loadFromBackend(lang);
}
```

---

**Version:** 1.0.0 | **Last Updated:** January 2026
