// models.ts

export interface Question {
  id?: string;             // Firebase key
  title: string;
  options: string[];
  correctAnswer: string;
  subject: string;
  subCategories: string[]; // required for quiz
  examTags: string[];      // required for quiz
  level?: string;          
  classTags?: string[];     

}


export interface PopularQuizSet {
  id?: string;
  title: string;
  subject?: string;
  ratings?: string[];
  subCategories?: string[];
  examTags?: string[];
  questionIds: string[];
  likes : string;
}

export interface Ebook {
  id?: string;
  title: string;
  subject: string;
  url: string;
}
