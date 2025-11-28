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
import { ArrowLeft } from 'lucide-react'
import { BuyStockData } from '@/features/types/features'
import { transactionApi } from '@/lib/api/transaction.api'
import { useAppSelector } from '@/lib/store/hooks'
import { selectUser } from '@/lib/store/authSlice'
import { useProfile } from '@/lib/hooks/useProfile'

type BuyStockFeatureProps = {
  data: BuyStockData
  onBack?: () => void
}

export function BuyStockFeature({ data, onBack }: BuyStockFeatureProps) {
  const reduxUser = useAppSelector(selectUser)
  const { profile } = useProfile(true)
  const [formValues, setFormValues] = useState<Record<string, any>>({})
  const [stepIndex, setStepIndex] = useState(data.currentStepIndex || 0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [readyToOrder, setReadyToOrder] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [orderFeedback, setOrderFeedback] = useState<string | null>(null)

  useEffect(() => {
    setStepIndex(data.currentStepIndex || 0)
    setFormValues({})
    setSuccessMessage(null)
    setReadyToOrder(false)
    setPlacingOrder(false)
    setOrderFeedback(null)
  }, [data])

  const currentStep = data.steps[stepIndex]

  if (!currentStep) return null

  const availableBalance = profile?.balance ?? reduxUser?.balance ?? 0
  const quantity = Number(formValues.quantity || 0)
  const estimatedCost = useMemo(() => {
    if (!quantity || quantity <= 0) return 0
    return quantity * data.currentPrice
  }, [quantity, data.currentPrice])

  const handleSubmit = () => {
    if (stepIndex < data.steps.length - 1) {
      setSuccessMessage(null)
      setStepIndex((prev) => Math.min(prev + 1, data.steps.length - 1))
      return
    }

    setIsSubmitting(true)
    // Placeholder for API integration
    setTimeout(() => {
      setIsSubmitting(false)
      setReadyToOrder(true)
      setSuccessMessage('Nhấn đặt lệnh ở dưới để mua.')
    }, 600)
  }

  const handlePreviousStep = () => {
    if (stepIndex === 0) return
    setStepIndex((prev) => Math.max(prev - 1, 0))
    setSuccessMessage(null)
    setReadyToOrder(false)
    setOrderFeedback(null)
  }

  const handlePlaceOrder = async () => {
    if (!reduxUser?._id) {
      setOrderFeedback('Vui lòng đăng nhập để đặt lệnh.')
      return
    }

    if (!quantity || quantity <= 0) {
      setOrderFeedback('Số lượng chưa hợp lệ.')
      return
    }

    setPlacingOrder(true)
    setOrderFeedback(null)
    try {
      const response = await transactionApi.createTransaction({
        userId: reduxUser._id,
        stock_code: data.symbol,
        stock_name: data.symbol,
        quantity,
        price_per_unit: data.currentPrice,
        transaction_type: 'BUY',
        notes: formValues.notes || `Quick buy (orderType: ${formValues.orderType || 'Market'})`,
      })

      setOrderFeedback(
        `Đặt lệnh thành công! Số dư mới: ${response.transaction.balance_after.toLocaleString(
          'vi-VN'
        )} VND.`
      )
      setReadyToOrder(false)
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof (error as any).message === 'string'
      ) {
        setOrderFeedback((error as any).message)
      } else if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        (error as any).response?.data?.message
      ) {
        setOrderFeedback((error as any).response.data.message)
      } else {
        setOrderFeedback('Không thể đặt lệnh, thử lại sau.')
      }
    } finally {
      setPlacingOrder(false)
    }
  }

  const progress = ((stepIndex + 1) / data.steps.length) * 100

  const isNextDisabled = useMemo(() => {
    if (isSubmitting) return true
    if (stepIndex === 0) {
      return !(quantity > 0)
    }
    if (stepIndex === 1) {
      const orderType = formValues.orderType
      if (!orderType) return true
      if (
        orderType === 'Market Order' &&
        availableBalance !== null &&
        estimatedCost > availableBalance
      ) {
        return true
      }
    }
    return false
  }, [stepIndex, quantity, formValues.orderType, estimatedCost, availableBalance, isSubmitting])

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
              Bước {stepIndex + 1}/{data.steps.length}
            </CardTitle>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {successMessage && readyToOrder && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
              {successMessage}
            </div>
          )}
          {orderFeedback && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              {orderFeedback}
            </div>
          )}
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
                      onValueChange={(value) => {
                        setFormValues((prev) => ({
                          ...prev,
                          [field.name]: value,
                        }))

                        if (
                          field.name === 'orderType' &&
                          value === 'Market Order' &&
                          quantity > 0 &&
                          estimatedCost > availableBalance
                        ) {
                          setOrderFeedback(
                            'Số dư không đủ để mua lệnh Market. Quay lại để điều chỉnh số lượng.'
                          )
                          setTimeout(() => {
                            handlePreviousStep()
                          }, 200)
                        }
                      }}
                    >
                      <SelectTrigger id={field.name}>
                        <SelectValue placeholder="Chọn một tùy chọn" />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem
                            key={option}
                            value={option}
                            disabled={
                              field.name === 'orderType' &&
                              option === 'Market Order' &&
                              quantity > 0 &&
                              estimatedCost > availableBalance
                            }
                          >
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

          {stepIndex === data.steps.length - 1 && (
            <div className="space-y-4 rounded-lg border border-border/60 bg-muted/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Mã cổ phiếu</span>
                <span className="font-semibold text-base">{data.symbol}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Số lượng</span>
                <span className="font-semibold text-base">
                  {quantity > 0 ? quantity.toLocaleString('vi-VN') : '—'} CP
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Giá/CP</span>
                <span className="font-semibold text-base">
                  {data.currentPrice.toLocaleString('vi-VN')} VND
                </span>
              </div>
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Tổng giá trị ước tính</span>
                <span>
                  {estimatedCost > 0 ? estimatedCost.toLocaleString('vi-VN') : '—'} VND
                </span>
              </div>
              {formValues.orderType && (
                <p className="text-sm text-muted-foreground">
                  Loại lệnh: <span className="font-medium text-foreground">{formValues.orderType}</span>
                </p>
              )}
              {formValues.notes && (
                <p className="text-sm text-muted-foreground">
                  Ghi chú: <span className="font-medium text-foreground">{formValues.notes}</span>
                </p>
              )}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Số dư khả dụng</span>
                  <span className="font-semibold text-slate-900">
                    {availableBalance.toLocaleString('vi-VN')} VND
                  </span>
                </div>
                {quantity > 0 && (
                  <div className="flex items-center justify-between mt-2">
                    <span>Tổng giá trị dự kiến</span>
                    <span
                      className={estimatedCost > availableBalance ? 'font-semibold text-rose-600' : 'font-semibold text-slate-900'}
                    >
                      {estimatedCost.toLocaleString('vi-VN')} VND
                    </span>
                  </div>
                )}
                {estimatedCost > availableBalance && (
                  <p className="mt-2 text-xs text-rose-600">
                    Số dư không đủ để đặt lệnh mua. Vui lòng giảm số lượng hoặc nạp thêm tiền.
                  </p>
                )}
              </div>
              {readyToOrder && (
                <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                  <Button
                    type="button"
                    className="flex-1 bg-green-600 text-white hover:bg-green-700"
                    disabled={placingOrder || estimatedCost > availableBalance || quantity <= 0}
                    onClick={handlePlaceOrder}
                  >
                    {placingOrder ? 'Đang đặt...' : 'Đặt lệnh'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-green-200 text-green-700 hover:bg-green-100"
                    onClick={() => {
                      setReadyToOrder(false)
                      setSuccessMessage(null)
                    }}
                  >
                    Đặt thêm sau
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            {stepIndex > 0 && (
              <Button
                type="button"
                variant="outline"
                className="sm:flex-1"
                disabled={isSubmitting || placingOrder}
                onClick={handlePreviousStep}
              >
                Quay lại
              </Button>
            )}
            <Button onClick={handleSubmit} className="flex-1" disabled={isNextDisabled}>
              {stepIndex === data.steps.length - 1 ? 'Xác nhận đặt lệnh' : 'Tiếp tục'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

