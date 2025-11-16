'use client'

import { CheckCircle2 } from 'lucide-react'

type HelpCardWidgetProps = {
  title: string
  description: string
  tips?: string[]
}

export function HelpCardWidget({ title, description, tips }: HelpCardWidgetProps) {
  return (
    <div className="rounded-2xl border bg-slate-50 p-3 space-y-2">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-700">{description}</p>

      {tips && tips.length > 0 && (
        <ul className="space-y-1 pt-2">
          {tips.map((tip, index) => (
            <li key={index} className="flex gap-2 text-xs text-slate-600">
              <CheckCircle2 className="h-3 w-3 flex-shrink-0 mt-0.5 text-blue-500" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
