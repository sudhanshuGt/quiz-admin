// Multi-language content structure
export interface LocalizedContent {
  [language: string]: string; // e.g., { 'en': 'English text', 'hi': 'हिंदी पाठ' }
}

export interface LocalizedOptionSet {
  [language: string]: string[]; // e.g., { 'en': ['Option A', 'Option B'], 'hi': ['विकल्प A', 'विकल्प B'] }
}

export interface Chapter {
  id?: string;
  examId: string;
  syllabusId: string;
  name: LocalizedContent | string;  // Support both old and new format
  imageUrl?: string;
}

export interface Syllabus {
  id?: string;
  examId: string;
  name: LocalizedContent | string;  // Support both old and new format
  imageUrl?: string;
}

export interface Exam {
  id?: string;
  name: LocalizedContent | string;  // Support both old and new format
  imageUrl?: string;  
}

export interface Question {
  id?: string;
  title: LocalizedContent | string;        // Multi-language support
  options: LocalizedOptionSet | string[];  // Multi-language options
  correctAnswer: LocalizedContent | string; // Multi-language correct answer
  imageUrl?: string;

  // hierarchy linking fields (optional but useful)
  examId?: string;
  examName?: string;
  syllabusId?: string;
  syllabusName?: string;
  chapterId?: string;
  chapterName?: string;
  
  // metadata
  languages?: string[];  // supported languages for this question
}

