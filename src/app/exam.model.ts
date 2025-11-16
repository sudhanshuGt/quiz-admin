export interface Chapter {
  id?: string;
  examId: string;
  syllabusId: string;
  name: string;
  imageUrl?: string;
}


export interface Syllabus {
  id?: string;
  examId: string;
  name: string;
  imageUrl?: string;
}


export interface Exam {
  id?: string;
  name: string;
  imageUrl?: string;  
}

export interface Question {
  id?: string;
  title: string;
  options: string[];        // length 4 expected
  correctAnswer: string;    // exact option text
  imageUrl?: string;        // optional manual url

  // hierarchy linking fields (optional but useful)
  examId?: string;
  examName?: string;
  syllabusId?: string;
  syllabusName?: string;
  chapterId?: string;
  chapterName?: string;
}

