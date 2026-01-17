"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { mockLessons } from "@/lib/mock-data"
import ReactMarkdown from "react-markdown"

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.id as string

  const lesson = mockLessons.find((l) => l.id === lessonId)

  if (!lesson) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background to-secondary">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-8 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Card className="p-8 text-center">
            <p className="text-muted-foreground text-lg">Lesson not found</p>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-8 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-card border-border">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <h1 className="text-3xl font-bold text-foreground">{lesson.lesson_title}</h1>
                  <Badge
                    variant="outline"
                    className={`text-sm ${
                      lesson.volatility_type.includes("up")
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

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                  <span>📅 {new Date(lesson.event_date).toLocaleDateString()}</span>
                  <span>💼 {lesson.symbol}</span>
                  <span>📊 {lesson.difficulty_level}</span>
                  <span>✅ {(lesson.confidence_score * 100).toFixed(0)}% confidence</span>
                </div>

                <div className="border-b border-border pb-6">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Event Summary</h3>
                  <p className="text-foreground">{lesson.news_summary}</p>
                </div>
              </div>

              {/* Content */}
              <div className="prose prose-invert max-w-none dark:prose-invert">
                <div className="markdown-content text-foreground space-y-4">
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
                      p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
                      li: ({ node, ...props }) => <li className="mb-2" {...props} />,
                      blockquote: ({ node, ...props }) => (
                        <blockquote
                          className="border-l-4 border-primary pl-4 py-2 my-4 italic text-muted-foreground"
                          {...props}
                        />
                      ),
                      code: ({ node, ...props }) => (
                        <code className="bg-secondary px-2 py-1 rounded text-sm font-mono" {...props} />
                      ),
                    }}
                  >
                    {lesson.lesson_content}
                  </ReactMarkdown>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <Card className="p-6 bg-card border-border">
              <h3 className="font-semibold text-foreground mb-4">Key Takeaways</h3>
              <ul className="space-y-3">
                {lesson.key_takeaways.map((takeaway, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="text-primary font-bold flex-shrink-0">{idx + 1}.</span>
                    <span className="text-sm text-foreground">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 bg-primary text-primary-foreground">
              <h3 className="font-semibold mb-2">About This Lesson</h3>
              <p className="text-sm leading-relaxed">
                This lesson explores real market events and how price movements relate to news and market sentiment.
                Learn from actual trading history.
              </p>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h3 className="font-semibold text-foreground mb-3">Navigation</h3>
              <Link href="/">
                <Button variant="outline" className="w-full border-border hover:bg-secondary bg-transparent">
                  Back to Dashboard
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
