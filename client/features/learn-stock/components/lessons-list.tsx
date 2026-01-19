"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, X } from "lucide-react"
import type { Lesson } from "@/lib/types"
import { useLearnStockStore } from "../stores/useLearnStockStore"

interface LessonsListProps {
  lessons: Lesson[]
}

export default function LessonsList({ lessons }: LessonsListProps) {
  const { selectedEventDate, setSelectedEventDate } = useLearnStockStore()
  const listRef = useRef<HTMLDivElement>(null)

  // Filter lessons based on selection
  const filteredLessons = selectedEventDate
    ? lessons.filter(l => l.event_date === selectedEventDate)
    : lessons

  // Group lessons by event_date (for normal view)
  const groupedLessons = filteredLessons.reduce(
    (acc, lesson) => {
      const date = lesson.event_date
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(lesson)
      return acc
    },
    {} as Record<string, Lesson[]>,
  )

  const sortedDates = Object.keys(groupedLessons).sort().reverse()

  // Auto-scroll when filtered
  useEffect(() => {
    if (selectedEventDate && listRef.current) {
      listRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [selectedEventDate])

  if (lessons.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          Click "Generate Lessons" to create learning content based on price movements
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6" ref={listRef}>
      {/* Active Filter Banner */}
      {selectedEventDate && (
        <div className="bg-primary/10 border border-primary/20 rounded-md p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div>
            <h3 className="font-semibold text-primary">Filtered by Date: {selectedEventDate}</h3>
            <p className="text-sm text-muted-foreground">Showing {filteredLessons.length} lessons for this event</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setSelectedEventDate(null)} className="gap-2">
            <X className="w-4 h-4" />
            Clear Filter
          </Button>
        </div>
      )}

      {/* Date Groups */}
      <div className="space-y-8">
        {sortedDates.map((date) => {
          const dateObj = new Date(date)
          const formattedDate = dateObj.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })

          return (
            <div key={date} className={selectedEventDate ? "block" : "block"}>
              <div className="mb-4 pb-3 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">{formattedDate}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {groupedLessons[date].length} learning {groupedLessons[date].length === 1 ? "event" : "events"}
                </p>
              </div>

              <div className="grid gap-4">
                {groupedLessons[date].map((lesson) => (
                  <Link key={lesson.id} href={`/dashboard/lesson/${lesson.id}`} className="block group">
                    <Card className="p-5 bg-secondary hover:bg-secondary/80 border-border transition-all duration-200 cursor-pointer">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {lesson.lesson_title}
                            </h4>
                            <Badge
                              variant="outline"
                              className={`text-xs whitespace-nowrap ${lesson.volatility_type.includes("up")
                                  ? "border-chart-up text-chart-up"
                                  : "border-chart-down text-chart-down"
                                }`}
                            >
                              {lesson.volatility_type === "strong_up"
                                ? "📈 Strong Up"
                                : lesson.volatility_type === "strong_down"
                                  ? "📉 Strong Down"
                                  : lesson.volatility_type}
                            </Badge>
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2">{lesson.news_summary}</p>

                          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                            <span>Level: {lesson.difficulty_level}</span>
                            <span>Confidence: {(lesson.confidence_score * 100).toFixed(0)}%</span>
                          </div>
                        </div>

                        <div className="flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
