import { Routes } from '@angular/router';
import { SingleQuizFormComponent } from './components/single-quiz-form.component';
import { PopularQuizSetFormComponent } from './components/popular-quiz-set-form.component';

export const routes: Routes = [
  { path: '', redirectTo: 'single-quiz', pathMatch: 'full' },
  { path: 'single-quiz', component: SingleQuizFormComponent },
  { path: 'popular-quiz', component: PopularQuizSetFormComponent },
  { path: '**', redirectTo: 'single-quiz' },
];
