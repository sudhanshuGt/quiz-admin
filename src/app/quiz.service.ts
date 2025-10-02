import { Injectable, inject } from '@angular/core';
import { Database, ref, push, set, get } from '@angular/fire/database';
import { Question, PopularQuizSet, Ebook } from './models';

@Injectable({ providedIn: 'root' })
export class QuizService {
  private db = inject(Database);

  // ---------------- Helper: read list ----------------
  private async readList(path: string): Promise<string[]> {
    const snapshot = await get(ref(this.db, path));
    if (!snapshot.exists()) return [];
    return Object.values(snapshot.val()) as string[];
  }

  // ---------------- Helper: add unique string ----------------
  private async addUnique(path: string, name: string) {
    const trimmed = (name || '').trim();
    if (!trimmed) return;
    const existing = await this.readList(path);
    if (!existing.includes(trimmed)) {
      const listRef = ref(this.db, path);
      const newRef = push(listRef);
      await set(newRef, trimmed);
    }
  }

  // ---------------- Add Question ----------------
  async addQuestion(q: Question): Promise<string | null> {
    const listRef = ref(this.db, 'questions');
    const newRef = push(listRef);
    await set(newRef, q);

    // Update global lists
    q.subCategories?.forEach(sub => this.addUnique('subCategories', sub));
    q.examTags?.forEach(tag => this.addUnique('examTags', tag));

    return newRef.key ?? null;
  }

 async addMultipleQuestions(questions: Question[]): Promise<string[]> {
  const ids: string[] = [];
  
  for (const q of questions) {
    const id = await this.addQuestion(q);
    if (id) ids.push(id);
  }

  return ids;
}


  async getQuestions(): Promise<Question[]> {
    const snapshot = await get(ref(this.db, 'questions'));
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.keys(data).map(id => ({ id, ...(data[id] as object) } as Question));
  }

  async getQuestionsByIds(ids: string[]): Promise<Question[]> {
    const snapshot = await get(ref(this.db, 'questions'));
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return ids.filter(id => !!data[id]).map(id => ({ id, ...(data[id] as object) } as Question));
  }

  async getQuestionsBySubject(subject: string): Promise<Question[]> {
    const all = await this.getQuestions();
    return all.filter(q => q.subject === subject);
  }

  // ---------------- Popular Quiz Sets ----------------
  async addPopularQuizSet(setData: PopularQuizSet): Promise<string | null> {
    const questions = await this.getQuestionsByIds(setData.questionIds || []);
    setData.subCategories = Array.from(new Set(questions.flatMap(q => q.subCategories || [])));
    setData.examTags = Array.from(new Set(questions.flatMap(q => q.examTags || [])));
  
    const listRef = ref(this.db, 'popularQuizSets');
    const newRef = push(listRef);
    await set(newRef, setData);

    setData.subCategories.forEach(s => this.addUnique('subCategories', s));
    setData.examTags.forEach(t => this.addUnique('examTags', t));
   

    return newRef.key ?? null;
  }

  // ---------------- Ebooks ----------------
  async addEbook(ebook: Ebook): Promise<string | null> {
    const listRef = ref(this.db, 'ebooks');
    const newRef = push(listRef);
    await set(newRef, ebook);
    return newRef.key ?? null;
  }

  // ---------------- Subjects ----------------
  async addSubject(name: string) {
    return this.addUnique('subjects', name);
  }
  async getSubjects(): Promise<string[]> {
    const list = await this.readList('subjects');
    return list.sort((a, b) => a.localeCompare(b));
  }

  // ---------------- SubCategories ----------------
  async getSubCategories(): Promise<string[]> {
    const list = await this.readList('subCategories');
    return list.sort((a, b) => a.localeCompare(b));
  }

  // ---------------- Exam Tags ----------------
  async getExamTags(): Promise<string[]> {
    const list = await this.readList('examTags');
    return list.sort((a, b) => a.localeCompare(b));
  }


  async addBulkQuestions(questions: Question[]) {
    for (const q of questions) {
      await this.addQuestion(q);
    }
  }


  parseBulkText(text: string): Question[] {
  const blocks = text.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
  const questions: Question[] = [];

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 6) continue; // question + 4 options + answer line

    const questionText = lines[0];
    const options = lines.slice(1, 5).map(l => l.replace(/^([A-D]\)|[A-D]\.)\s*/, '').trim());
    const answerLine = lines[5];

    const correctAnswer = answerLine.replace(/^Answer:\s*/i, '').trim();

    questions.push({
      title: questionText,
      options,
      correctAnswer,
      subject: '',
      subCategories: [],
      examTags: []
    });
  }

  return questions;
}

async getClasses(): Promise<string[]> {
    const classesRef = ref(this.db, 'classes'); // your Firebase path for classes
    const snapshot = await get(classesRef);
    if (!snapshot.exists()) return [];
    return Object.values(snapshot.val()) as string[];
  }

}
