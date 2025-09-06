// models.ts
export interface SingleQuiz {
  title: string;
  options: string[];
  correctAnswer: string;   // store the option text
  subject?: string;
}

export interface BulkPreviewQuiz extends SingleQuiz {
  missingAnswer: boolean;
}


export interface PopularQuizSet {
  title: string;
  subject?: string;
  ratings?: string[];
  questions: {
    title: string;
    options: string[];
    correctAnswer: string;
  }[];
}

