export interface Lesson {
  id: string
  symbol: string
  event_date: string
  volatility_type: string
  news_summary: string
  lesson_title: string
  lesson_content: string
  key_takeaways: string[]
  difficulty_level: "beginner" | "intermediate" | "advanced"
  confidence_score: number
}

export interface CandleData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  events?: string[]
}
