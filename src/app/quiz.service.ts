import { Injectable, inject } from '@angular/core';
import { Question, PopularQuizSet, Ebook } from './models';
 
import { Firestore, collection, doc, setDoc, getDocs, query, where } from '@angular/fire/firestore';
 

@Injectable({ providedIn: 'root' })
export class QuizService {
  private firestore = inject(Firestore);

  // ---------------- Helper: get collection reference ----------------
  private col(path: string) {
    return collection(this.firestore, path);
  }

  // ---------------- Helper: read list of strings ----------------
  private async readList(path: string): Promise<string[]> {
    const snapshot = await getDocs(this.col(path));
    return snapshot.docs.map(d => d.data()['value'] as string).filter(Boolean);
  }

  // ---------------- Helper: add unique string ----------------
  private async addUnique(path: string, name: string) {
    const trimmed = (name || '').trim();
    if (!trimmed) return;
    const existing = await this.readList(path);
    if (!existing.includes(trimmed)) {
      const newDoc = doc(this.col(path));
      await setDoc(newDoc, { value: trimmed });
    }
  }

  // ---------------- Add Question ----------------
  async addQuestion(q: Question): Promise<string | null> {
    const newDoc = doc(this.col('questions'));
    await setDoc(newDoc, q);

    // Update global lists
    q.subCategories?.forEach(sub => this.addUnique('subCategories', sub));
    q.examTags?.forEach(tag => this.addUnique('examTags', tag));

    return newDoc.id;
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
    const snapshot = await getDocs(this.col('questions'));
    return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as object) } as Question));
  }

  async getQuestionsByIds(ids: string[]): Promise<Question[]> {
    const snapshot = await getDocs(this.col('questions'));
    return snapshot.docs
      .filter(d => ids.includes(d.id))
      .map(d => ({ id: d.id, ...(d.data() as object) } as Question));
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

    const newDoc = doc(this.col('popularQuizSets'));
    await setDoc(newDoc, setData);

    setData.subCategories.forEach(s => this.addUnique('subCategories', s));
    setData.examTags.forEach(t => this.addUnique('examTags', t));

    return newDoc.id;
  }

  // ---------------- Ebooks ----------------
  async addEbook(ebook: Ebook): Promise<string | null> {
    const newDoc = doc(this.col('ebooks'));
    await setDoc(newDoc, ebook);
    return newDoc.id;
  }

  // ---------------- Subjects ----------------
  async addSubject(name: string) {
    return this.addUnique('subjects', name);
  }

  async getSubjects(): Promise<string[]> {
    const list = await this.readList('subjects');
    return list.sort((a, b) => a.localeCompare(b));
  }

  async getSubCategories(): Promise<string[]> {
    const list = await this.readList('subCategories');
    return list.sort((a, b) => a.localeCompare(b));
  }

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
    const snapshot = await getDocs(this.col('classes'));
    return snapshot.docs.map(d => d.data()['value'] as string).filter(Boolean);
  }
}

