'use client'

import { useEffect, useMemo, useState } from 'react'
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
import { transactionApi } from '@/lib/api/transaction.api'
import { useAppSelector } from '@/lib/store/hooks'
import { selectUser } from '@/lib/store/authSlice'

type BuyFlowViewProps = {
  buyFlow: {
    symbol: string
    currentPrice: number
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
  const reduxUser = useAppSelector(selectUser)
  const [formValues, setFormValues] = useState<Record<string, any>>(buyFlow.draftValues || {})
  const [stepIndex, setStepIndex] = useState(buyFlow.currentStepIndex || 0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    setFormValues(buyFlow.draftValues || {})
    setStepIndex(buyFlow.currentStepIndex || 0)
    setError(null)
    setSuccessMessage(null)
  }, [buyFlow])

  const currentStep = buyFlow.steps[stepIndex]

  if (!currentStep) return null

  const quantity = Number(formValues.quantity || 0)
  const estimatedCost = useMemo(() => {
    if (!quantity || quantity <= 0) return 0
    return quantity * buyFlow.currentPrice
  }, [quantity, buyFlow.currentPrice])

  const userId = reduxUser?._id

  const availableBalance = reduxUser?.balance ?? 0
  const isMarketOrderInsufficient =
    formValues.orderType === 'Market Order' &&
    quantity > 0 &&
    estimatedCost > availableBalance

  const handleSubmit = async () => {
    if (stepIndex < buyFlow.steps.length - 1) {
      setError(null)
      setSuccessMessage(null)
      setStepIndex((prev) => Math.min(prev + 1, buyFlow.steps.length - 1))
      return
    }

    if (!userId) {
      setError('Vui lòng đăng nhập để thực hiện giao dịch.')
      return
    }

    if (!quantity || quantity <= 0) {
      setError('Vui lòng nhập số lượng hợp lệ trước khi đặt lệnh.')
      return
    }

    if (estimatedCost > availableBalance) {
      setError('Số dư không đủ để đặt lệnh mua. Vui lòng giảm số lượng hoặc nạp thêm tiền.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await transactionApi.createTransaction({
        userId,
        stock_code: buyFlow.symbol,
        stock_name: buyFlow.symbol,
        quantity,
        price_per_unit: buyFlow.currentPrice,
        transaction_type: 'BUY',
        notes: `Chatbot quick order (${formValues.orderType || 'Market'})`,
      })

      setSuccessMessage(
        `Đặt lệnh mua ${quantity} cổ phiếu ${buyFlow.symbol} thành công. Số dư mới: ${response.transaction.balance_after.toLocaleString(
          'vi-VN'
        )} VND.`
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể đặt lệnh mua.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = ((stepIndex + 1) / buyFlow.steps.length) * 100

  return (
    <Card className="bg-card border border-border/50 shadow-lg backdrop-blur-sm">
      <CardHeader>
        <CardTitle>
          Buy {buyFlow.symbol} – Step {stepIndex + 1}/{buyFlow.steps.length}
        </CardTitle>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{currentStep.title}</h3>
          <p className="text-sm text-muted-foreground">{currentStep.description}</p>

          {currentStep.helperText && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-xs text-primary">💡 {currentStep.helperText}</p>
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
        {(error || successMessage) && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${error
              ? 'border-error bg-error-light text-red-700'
              : 'border-success bg-success-light text-green-700'
              }`}
          >
            {error || successMessage}
          </div>
        )}
        {quantity > 0 && (
          <div className="rounded-lg border border-border/40 bg-muted/10 p-3 text-sm text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Số dư khả dụng</span>
              <span className="font-semibold text-foreground">
                {availableBalance.toLocaleString('vi-VN')} VND
              </span>
            </div>
            <div className="flex justify-between">
              <span>Ước tính chi phí</span>
              <span className={estimatedCost > availableBalance ? 'font-semibold text-rose-600' : 'font-semibold text-foreground'}>
                {estimatedCost.toLocaleString('vi-VN')} VND
              </span>
            </div>
            {isMarketOrderInsufficient && (
              <p className="text-xs text-rose-600">
                Số dư không đủ cho lệnh Market. Vui lòng giảm số lượng.
              </p>
            )}
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleSubmit}
            className="flex-1"
            disabled={
              isSubmitting ||
              quantity <= 0 ||
              (stepIndex === buyFlow.steps.length - 1 && estimatedCost > availableBalance) ||
              (stepIndex === 1 && isMarketOrderInsufficient)
            }
          >
            {stepIndex === buyFlow.steps.length - 1 ? 'Đặt lệnh mua' : 'Tiếp tục'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

