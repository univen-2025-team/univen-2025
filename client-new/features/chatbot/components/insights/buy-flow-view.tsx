'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

type BuyFlowViewProps = {
  buyFlow: {
    symbol: string
    currentStepIndex: number
    steps: Array<{
      id: string
      title: string
      description: string
      helperText?: string
      fields?: {
        type: 'text' | 'number' | 'select'
        name: string
        label: string
        placeholder?: string
        options?: string[]
      }[]
    }>
    draftValues: Record<string, any>
  }
}

export function BuyFlowView({ buyFlow }: BuyFlowViewProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>(buyFlow.draftValues || {})
  const currentStep = buyFlow.steps[buyFlow.currentStepIndex]

  if (!currentStep) return null

  const handleSubmit = () => {
    // In real implementation, this would update the dashboard state
    console.log(`Buy flow step submitted: ${currentStep.id}`, formValues)
  }

  const progress = ((buyFlow.currentStepIndex + 1) / buyFlow.steps.length) * 100

  return (
    <Card className="bg-gradient-to-br from-card to-card/95 border border-border/50 shadow-lg backdrop-blur-sm">
      <CardHeader>
        <CardTitle>
          Buy {buyFlow.symbol} – Step {buyFlow.currentStepIndex + 1}/{buyFlow.steps.length}
        </CardTitle>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{currentStep.title}</h3>
          <p className="text-sm text-muted-foreground">{currentStep.description}</p>

          {currentStep.helperText && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-xs text-blue-800">💡 {currentStep.helperText}</p>
            </div>
          )}
        </div>

        {/* Form Fields */}
        {currentStep.fields && currentStep.fields.length > 0 && (
          <div className="space-y-4 rounded-lg border border-border/40 bg-muted/20 p-4">
            {currentStep.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name} className="text-sm font-medium">
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
                    <SelectTrigger id={field.name}>
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
          <Button onClick={handleSubmit} className="flex-1">
            {buyFlow.currentStepIndex === buyFlow.steps.length - 1
              ? 'Complete Order'
              : 'Continue'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

