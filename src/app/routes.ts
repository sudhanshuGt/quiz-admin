import { Routes } from '@angular/router';
import { SingleQuizFormComponent } from './components/single-quiz/single-quiz-form.component'; 
import { SubjectFormComponent } from './components/subjects/subject-form.component';
import { EbookFormComponent } from './components/ebooks/ebook-form.component';
import { PopularQuizComponent } from './components/popular-quiz/popular-quiz.component';
import { ExamComponent } from './components/exam/exam.component';

export const routes: Routes = [
  { path: '', redirectTo: 'single-quiz', pathMatch: 'full' },
  { path: 'single-quiz', component: SingleQuizFormComponent }, 
  { path: 'subjects', component: SubjectFormComponent },
  { path: 'ebooks', component: EbookFormComponent },
  { path: 'popular-quiz', component: PopularQuizComponent },
  {path : 'exam', component: ExamComponent},
  { path: '**', redirectTo: 'single-quiz' }
];