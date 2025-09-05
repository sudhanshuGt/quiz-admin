// models.ts
export interface SingleQuiz {
  title: string;
  options: [string, string, string, string];
  subject?: string;   // <-- optional tag
}

export interface PopularQuizSet {
  title: string;
  subject?: string;
  questions: {
    title: string;
    options: [string, string, string, string];
  }[];
}
