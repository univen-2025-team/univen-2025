'use client'

import { useState } from 'react'
import { BuyFlowStep } from '../types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'

type BuyFlowWidgetProps = {
  symbol: string
  steps: BuyFlowStep[]
  currentStepIndex: number
  onStepSubmit?: (stepId: string, values: Record<string, any>) => void
}

export function BuyFlowWidget({
  symbol,
  steps,
  currentStepIndex,
  onStepSubmit,
}: BuyFlowWidgetProps) {
  const currentStep = steps[currentStepIndex]
  const [formValues, setFormValues] = useState<Record<string, any>>({})

  if (!currentStep) return null

  const handleSubmit = () => {
    onStepSubmit?.(currentStep.id, formValues)
    setFormValues({})
  }

  const progress = ((currentStepIndex + 1) / steps.length) * 100

  return (
    <div className="rounded-2xl border bg-white shadow-md p-4 space-y-3">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-900">
          Buy {symbol} – Step {currentStepIndex + 1}/{steps.length}
        </h3>
        <Progress value={progress} className="h-1" />
      </div>

      {/* Step Content */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-900">{currentStep.title}</p>
        <p className="text-sm text-slate-700">{currentStep.description}</p>

        {currentStep.helperText && (
          <p className="text-xs text-slate-500 bg-blue-50 p-2 rounded border border-blue-200">
            💡 {currentStep.helperText}
          </p>
        )}
      </div>

      {/* Form Fields */}
      {currentStep.fields && currentStep.fields.length > 0 && (
        <div className="space-y-3 bg-slate-50 p-3 rounded-lg">
          {currentStep.fields.map((field) => (
            <div key={field.name} className="space-y-1">
              <Label htmlFor={field.name} className="text-xs font-medium text-slate-700">
                {field.label}
              </Label>

              {field.type === 'number' || field.type === 'text' ? (
                <Input
                  id={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formValues[field.name] || ''}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      [field.name]: e.target.value,
                    })
                  }
                  className="text-sm"
                />
              ) : field.type === 'select' ? (
                <Select
                  value={formValues[field.name] || ''}
                  onValueChange={(value) =>
                    setFormValues({
                      ...formValues,
                      [field.name]: value,
                    })
                  }
                >
                  <SelectTrigger id={field.name} className="text-sm">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {/* Action Button */}
      <div className="flex gap-2 pt-2">
        <Button
          onClick={handleSubmit}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm"
        >
          {currentStepIndex === steps.length - 1 ? 'Confirm' : 'Next'}
        </Button>
      </div>
    </div>
  )
}
