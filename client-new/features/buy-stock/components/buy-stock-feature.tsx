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
import { ArrowLeft } from 'lucide-react'
import { BuyStockData, FeatureInstruction } from '@/features/types/features'

type BuyStockFeatureProps = {
  data: BuyStockData
  onBack?: () => void
}

export function BuyStockFeature({ data, onBack }: BuyStockFeatureProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>({})
  const currentStep = data.steps[data.currentStepIndex]

  if (!currentStep) return null

  const handleSubmit = () => {
    // In real implementation, this would update the feature state or trigger API call
    console.log(`Buy flow step submitted: ${currentStep.id}`, formValues)
  }

  const progress = ((data.currentStepIndex + 1) / data.steps.length) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold">Mua {data.symbol}</h1>
          <p className="text-sm text-muted-foreground">
            Giá hiện tại: {data.currentPrice.toLocaleString('vi-VN')} VND
          </p>
        </div>
      </div>

      {/* Main Card */}
      <Card className="bg-gradient-to-br from-card to-card/95 border border-border/50 shadow-lg">
        <CardHeader>
          <div className="space-y-2">
            <CardTitle>
              Bước {data.currentStepIndex + 1}/{data.steps.length}
            </CardTitle>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step Content */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">{currentStep.title}</h2>
            <CardDescription className="text-base">{currentStep.description}</CardDescription>

            {currentStep.helperText && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:bg-blue-950 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 {currentStep.helperText}
                </p>
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
                        <SelectValue placeholder="Chọn một tùy chọn" />
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
              {data.currentStepIndex === data.steps.length - 1 ? 'Xác nhận đặt lệnh' : 'Tiếp tục'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

