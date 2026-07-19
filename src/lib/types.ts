export interface User {
  id: number;
  email: string;
  username: string;
  target_band: number;
  current_band: number;
  continuous_days: number;
  created_time: string;
}

export interface Sentence {
  id: number;
  english: string;
  chinese: string;
  topic: string;
  band_level: string;
  tags: string;
  source: string;
}

export interface PracticeResult {
  id: number;
  sentence_id: number;
  english: string;
  chinese: string;
  answer: string;
  score: number;
  practice_time: string;
  feedback: {
    total_score: number;
    grammar_score: number;
    vocabulary_score: number;
    collocation_score: number;
    naturalness_score: number;
    errors: Array<{
      type: string;
      wrong: string;
      correct: string;
      context: string;
    }>;
    improvement: string;
    optimized_version: string;
    ielts_tips: string;
  } | null;
}

export interface UserError {
  id: number;
  error_type: string;
  wrong: string;
  correct: string;
  context: string;
  count: number;
}

export interface ReviewItem {
  id: number;
  content_type: string;
  content_id: number;
  mastery: number;
  review_count: number;
  next_review_time: string;
  content: Record<string, unknown> | null;
}

export interface Vocabulary {
  id: number;
  word: string;
  meaning: string;
  synonyms: string;
  collocations: string;
  example: string;
  topic: string;
  band_level: string;
}

export interface Idea {
  id: number;
  topic: string;
  question: string;
  position: string;
  reason: string;
  explanation: string;
  example: string;
  related_words: string;
  band_level: string;
}

export interface Essay {
  id: number;
  title: string;
  content: string;
  band_score: string;
  topic: string;
  analysis: string;
  source: string;
  analysis_detail?: {
    estimated_band: string;
    detected_topic: string;
    analysis_text: string;
    paragraphs: Array<{ type: string; text: string; word_count: number }>;
    vocabulary_highlights: string[];
  };
}

export interface EssayPractice {
  id: number;
  user_id: number;
  question: string;
  content: string;
  word_count: number;
  submitted: boolean;
  score: EssayScore | null;
  created_time: string;
}

export interface EssayScore {
  task_response: number;
  coherence: number;
  lexical_resource: number;
  grammar: number;
  overall: number;
  feedback: string;
  suggestions: string[];
}

export interface DashboardData {
  today_review_count: number;
  today_error_count: number;
  today_practice_count: number;
  recent_errors: UserError[];
  review_items: ReviewItem[];
  total_practices: number;
  average_score: number;
  weekly_practice_count: number;
  continuous_days: number;
  error_reduction: number;
}

