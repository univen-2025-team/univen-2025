'use client'

/**
 * Buy Stock Feature - Step-by-step wizard for buying stocks via chatbot
 * 
 * Flow:
 * - Step 0: Nhập số lượng cổ phiếu
 * - Step 1: Chọn loại lệnh (Market/Limit) và ghi chú
 * - Step 2: Xác nhận thông tin giao dịch
 * - Step 3: Hiển thị kết quả (success/failure)
 */

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
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { BuyStockData } from '@/features/types/features'
import { transactionApi } from '@/lib/api/transaction.api'
import { useAppSelector } from '@/lib/store/hooks'
import { selectUser } from '@/lib/store/authSlice'
import { useProfile } from '@/lib/hooks/useProfile'

type BuyStockFeatureProps = {
  data: BuyStockData
  onBack?: () => void
}

type TransactionResult = {
  success: boolean
  message: string
  balance_after?: number
  transaction_id?: string
}

export function BuyStockFeature({ data, onBack }: BuyStockFeatureProps) {
  // ==================== HOOKS (Must be at top - React Rules) ====================
  const reduxUser = useAppSelector(selectUser)
  const { profile, refetch: refetchProfile } = useProfile(true)
  
  const [formValues, setFormValues] = useState<Record<string, any>>({})
  const [stepIndex, setStepIndex] = useState(data.currentStepIndex || 0)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [transactionResult, setTransactionResult] = useState<TransactionResult | null>(null)
  const [balanceWarning, setBalanceWarning] = useState<string | null>(null)

  // ==================== COMPUTED VALUES ====================
  const availableBalance = 
    (typeof profile?.balance === 'number' ? profile.balance : null) ?? 
    (typeof reduxUser?.balance === 'number' ? reduxUser.balance : null) ?? 
    0
  
  const quantity = Number(formValues.quantity || 0)
  const estimatedCost = useMemo(() => {
    if (!quantity || quantity <= 0) return 0
    return quantity * data.currentPrice
  }, [quantity, data.currentPrice])

  useEffect(() => {
    console.log('🔍 BuyStockFeature data:', { 
      symbol: data.symbol, 
      price: data.currentPrice, 
      stepsLength: data.steps.length,
      steps: data.steps 
    })
    
    // Chỉ reset khi data.symbol thay đổi (mua CP khác)
    // Không reset khi đang trong quá trình giao dịch
    const isNewStock = data.symbol !== formValues._lastSymbol
    
    if (isNewStock) {
      setStepIndex(data.currentStepIndex || 0)
      setFormValues({ _lastSymbol: data.symbol })
      setPlacingOrder(false)
      setTransactionResult(null)
      setBalanceWarning(null)
    }
  }, [data.symbol, data.currentStepIndex])

  // Check balance when quantity or price changes
  useEffect(() => {
    if (quantity > 0 && estimatedCost > availableBalance) {
      setBalanceWarning(
        `⚠️ Số dư không đủ! Cần ${estimatedCost.toLocaleString('vi-VN')} VND nhưng chỉ có ${availableBalance.toLocaleString('vi-VN')} VND`
      )
    } else {
      setBalanceWarning(null)
    }
  }, [quantity, estimatedCost, availableBalance])

  // Auto-reset step index nếu vượt quá số steps
  useEffect(() => {
    if (!transactionResult && stepIndex >= data.steps.length) {
      setStepIndex(0)
    }
  }, [stepIndex, data.steps.length, transactionResult])

  // ==================== RENDER ====================
  const currentStep = transactionResult ? null : data.steps[stepIndex]
  
  if (!transactionResult && !currentStep) {
    return null
  }

  // ==================== HANDLERS ====================
  const handleSubmit = () => {
    if (stepIndex === 0) {
      if (estimatedCost > availableBalance) {
        setBalanceWarning(
          `❌ Không thể tiếp tục! Số dư không đủ để mua ${quantity} CP. Vui lòng giảm số lượng.`
        )
        return
      }
      setStepIndex(1)
      return
    }

    if (stepIndex === 1) {
      setStepIndex(2)
      return
    }

    if (stepIndex === 2) {
      handlePlaceOrder()
      return
    }
  }

  const handlePreviousStep = () => {
    if (stepIndex === 0) return
    if (transactionResult) {
      // Nếu đang ở màn kết quả, reset về bước đầu
      setTransactionResult(null)
      setStepIndex(0)
      setFormValues({})
      return
    }
    setStepIndex((prev) => Math.max(prev - 1, 0))
    setBalanceWarning(null)
  }

  const handlePlaceOrder = async () => {
    // Validation
    if (!reduxUser?._id) {
      setTransactionResult({
        success: false,
        message: 'Vui lòng đăng nhập để đặt lệnh.',
      })
      setStepIndex(3)
      return
    }

    if (!quantity || quantity <= 0) {
      setTransactionResult({
        success: false,
        message: 'Số lượng không hợp lệ.',
      })
      setStepIndex(3)
      return
    }

    if (estimatedCost > availableBalance) {
      setTransactionResult({
        success: false,
        message: `Số dư không đủ! Cần ${estimatedCost.toLocaleString('vi-VN')} VND nhưng chỉ có ${availableBalance.toLocaleString('vi-VN')} VND.`,
      })
      setStepIndex(3)
      return
    }

    setPlacingOrder(true)
    
    const payload = {
      userId: reduxUser._id,
      stock_code: data.symbol,
      stock_name: data.symbol,
      quantity,
      price_per_unit: data.currentPrice,
      transaction_type: 'BUY' as const,
      notes: formValues.notes || `${formValues.orderType || 'Market'} order`,
    }
    
    try {
      const response = await transactionApi.createTransaction(payload)
      await refetchProfile()

      setTransactionResult({
        success: true,
        message: 'Đặt lệnh mua thành công!',
        balance_after: response.transaction.balance_after,
        transaction_id: response.transaction.transaction_id,
      })
      setStepIndex(3)
    } catch (error) {
      let errorMessage = 'Không thể đặt lệnh, vui lòng thử lại sau.'
      
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as any).message
      } else if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        (error as any).response?.data?.message
      ) {
        errorMessage = (error as any).response.data.message
      }

      setTransactionResult({
        success: false,
        message: errorMessage,
      })
      setStepIndex(3)
    } finally {
      setPlacingOrder(false)
    }
  }

  // ==================== UI STATE ====================
  const totalSteps = 4
  const progress = ((stepIndex + 1) / totalSteps) * 100

  const isNextDisabled = useMemo(() => {
    if (placingOrder || transactionResult) return true
    
    if (stepIndex === 0) {
      return !(quantity > 0) || estimatedCost > availableBalance
    }
    
    if (stepIndex === 1) {
      return !formValues.orderType
    }
    
    return false
  }, [stepIndex, quantity, formValues.orderType, estimatedCost, availableBalance, placingOrder, transactionResult])

  // Render màn hình kết quả giao dịch (bước 4)
  if (transactionResult) {
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
            <h1 className="text-2xl font-bold">Kết quả giao dịch</h1>
            <p className="text-sm text-muted-foreground">{data.symbol}</p>
          </div>
        </div>

        {/* Result Card */}
        <Card className="bg-gradient-to-br from-card to-card/95 border border-border/50 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-center py-4">
              {transactionResult.success ? (
                <CheckCircle2 className="h-20 w-20 text-green-600" />
              ) : (
                <XCircle className="h-20 w-20 text-red-600" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className={`text-2xl font-bold ${transactionResult.success ? 'text-green-600' : 'text-red-600'}`}>
                {transactionResult.success ? '✅ Giao dịch thành công!' : '❌ Giao dịch thất bại'}
              </h2>
              <p className="text-muted-foreground">{transactionResult.message}</p>
            </div>

            {transactionResult.success && (
              <div className="space-y-4 rounded-lg border border-border/60 bg-muted/10 p-4">
                <h3 className="font-semibold text-lg">Chi tiết giao dịch</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Mã cổ phiếu</span>
                    <span className="font-semibold">{data.symbol}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Số lượng</span>
                    <span className="font-semibold">{quantity.toLocaleString('vi-VN')} CP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Giá/CP</span>
                    <span className="font-semibold">{data.currentPrice.toLocaleString('vi-VN')} VND</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tổng giá trị</span>
                    <span className="font-semibold">{estimatedCost.toLocaleString('vi-VN')} VND</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Loại lệnh</span>
                    <span className="font-semibold">{formValues.orderType || 'Market Order'}</span>
                  </div>
                </div>
              </div>
            )}

            {transactionResult.success && transactionResult.balance_after !== undefined && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <h3 className="font-semibold text-green-800 mb-2">💰 Thông tin tài khoản sau giao dịch</h3>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-700">Số dư trước</span>
                    <span className="font-semibold text-green-900">{availableBalance.toLocaleString('vi-VN')} VND</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-700">Số tiền đã chi</span>
                    <span className="font-semibold text-red-600">-{estimatedCost.toLocaleString('vi-VN')} VND</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-green-300">
                    <span className="text-sm font-semibold text-green-700">Số dư hiện tại</span>
                    <span className="text-lg font-bold text-green-900">
                      {transactionResult.balance_after.toLocaleString('vi-VN')} VND
                    </span>
                  </div>
                </div>
              </div>
            )}

            {!transactionResult.success && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-800 mb-1">Lý do thất bại</h3>
                    <p className="text-sm text-red-700">{transactionResult.message}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={() => {
                  setTransactionResult(null)
                  setStepIndex(0)
                  setFormValues({})
                }}
                className="flex-1"
                variant={transactionResult.success ? 'default' : 'outline'}
              >
                {transactionResult.success ? 'Mua thêm' : 'Thử lại'}
              </Button>
              {onBack && (
                <Button onClick={onBack} variant="outline" className="flex-1">
                  Quay về thị trường
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

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
              {stepIndex === 0 && 'Bước 1/3: Nhập thông tin'}
              {stepIndex === 1 && 'Bước 2/3: Cấu hình lệnh'}
              {stepIndex === 2 && 'Bước 3/3: Xác nhận giao dịch'}
            </CardTitle>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {balanceWarning && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-800">
              {balanceWarning}
            </div>
          )}
          
          {/* Step Content */}
          {currentStep && (
            <>
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

                      }}
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

              {/* Summary at step 3 (Xác nhận) */}
              {stepIndex === 2 && (
            <div className="space-y-4 rounded-lg border border-border/60 bg-muted/10 p-4">
              <h3 className="font-semibold text-lg">📋 Tóm tắt lệnh</h3>
              <div className="space-y-3">
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
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Loại lệnh</span>
                  <span className="font-semibold">{formValues.orderType || 'Market Order'}</span>
                </div>
                {formValues.notes && (
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-muted-foreground">Ghi chú</span>
                    <span className="font-medium text-foreground text-right max-w-[60%]">{formValues.notes}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t text-lg font-bold">
                  <span>Tổng giá trị</span>
                  <span className="text-blue-600">
                    {estimatedCost > 0 ? estimatedCost.toLocaleString('vi-VN') : '—'} VND
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600">Số dư hiện tại</span>
                  <span className="font-semibold text-slate-900">
                    {availableBalance.toLocaleString('vi-VN')} VND
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Số dư sau giao dịch</span>
                  <span className={`font-semibold ${estimatedCost > availableBalance ? 'text-red-600' : 'text-green-600'}`}>
                    {(availableBalance - estimatedCost).toLocaleString('vi-VN')} VND
                  </span>
                </div>
                {estimatedCost > availableBalance && (
                  <p className="mt-3 text-xs text-rose-600 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Số dư không đủ! Vui lòng quay lại và giảm số lượng hoặc nạp thêm tiền.</span>
                  </p>
                )}
              </div>
            </div>
              )}
            </>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            {stepIndex > 0 && (
              <Button
                type="button"
                variant="outline"
                className="sm:flex-1"
                disabled={placingOrder}
                onClick={handlePreviousStep}
              >
                ← Quay lại
              </Button>
            )}
            <Button 
              onClick={handleSubmit} 
              className="flex-1" 
              disabled={isNextDisabled}
            >
              {placingOrder ? (
                <>⏳ Đang xử lý...</>
              ) : stepIndex === 2 ? (
                <>Xác nhận đặt lệnh</>
              ) : (
                <>Tiếp tục →</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

