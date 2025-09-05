import { Injectable, inject } from '@angular/core';
import { Database, ref, push, set } from '@angular/fire/database';
import { PopularQuizSet, SingleQuiz } from './models';

@Injectable({ providedIn: 'root' })
export class QuizService {
  private db = inject(Database);

  addSingleQuiz(q: SingleQuiz) {
    const listRef = ref(this.db, 'quiz');
    const newRef = push(listRef);
    return set(newRef, q);
  }

  addMultipleSingleQuizzes(quizzes: SingleQuiz[]) {
    const listRef = ref(this.db, 'quiz');
    quizzes.forEach(q => {
      const newRef = push(listRef);
      set(newRef, q);
    });
  }

  addPopularQuizSet(setData: PopularQuizSet) {
    const listRef = ref(this.db, 'popularQuiz');
    const newRef = push(listRef);
    return set(newRef, setData);
  }

  addMultiplePopularQuizSets(sets: PopularQuizSet[]) {
  const listRef = ref(this.db, 'popularQuiz');
  const promises = sets.map(setData => {
    const newRef = push(listRef);
    return set(newRef, setData);
  });
  return Promise.all(promises);
}

}
 
