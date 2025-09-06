import { Routes } from '@angular/router';
import { SingleQuizFormComponent } from './components/single-quiz/single-quiz-form.component';
import { PopularQuizSetFormComponent } from './components/popular-quiz/popular-quiz-set-form.component';
import { SubjectFormComponent } from './components/subjects/subject-form.component';
import { EbookFormComponent } from './components/ebooks/ebook-form.component';

export const routes: Routes = [
  { path: '', redirectTo: 'single-quiz', pathMatch: 'full' },
  { path: 'single-quiz', component: SingleQuizFormComponent },
  { path: 'popular-quiz', component: PopularQuizSetFormComponent },
  {path: 'subjects', component: SubjectFormComponent},
  {path: 'ebooks', component: EbookFormComponent},
  { path: '**', redirectTo: 'single-quiz' },
];
