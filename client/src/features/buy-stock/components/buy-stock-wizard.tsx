'use client'

/**
 * Buy Stock Wizard - Sử dụng trade components cho UI nhất quán
 * 
 * Flow:
 * - Step 0: Nhập số lượng 
 * - Step 1: Chọn loại lệnh và ghi chú
 * - Step 2: Review & confirm 
 * - Step 3: Kết quả giao dịch
 */

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { ArrowLeft, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { BuyStockData } from '@/features/types/features'
import { transactionApi } from '@/lib/api/transaction.api'
import { useAppSelector } from '@/lib/store/hooks'
import { selectUser } from '@/lib/store/authSlice'
import { useProfile } from '@/lib/hooks/useProfile'
import { getStockData } from '@/lib/api/market-cache'
import type { TransactionMetadata } from '@/lib/types/transactions'

type BuyStockWizardProps = {
  data: BuyStockData
  onBack?: () => void
}

type TransactionResult = {
  success: boolean
  message: string
  transaction?: TransactionMetadata
}

export function BuyStockWizard({ data, onBack }: BuyStockWizardProps) {
  // ==================== STATE ====================
  const reduxUser = useAppSelector(selectUser)
  const { profile, refetch: refetchProfile } = useProfile(true)
  
  const [stepIndex, setStepIndex] = useState(0)
  const [quantity, setQuantity] = useState(0)
  const [orderType, setOrderType] = useState<string>('Market Order')
  const [notes, setNotes] = useState('')
  const [placingOrder, setPlacingOrder] = useState(false)
  const [transactionResult, setTransactionResult] = useState<TransactionResult | null>(null)
  
  // Fetch giá từ API khi component mount
  const [currentPrice, setCurrentPrice] = useState(data.currentPrice || 0)
  const [isLoadingPrice, setIsLoadingPrice] = useState(data.currentPrice === 0)

  // ==================== FETCH STOCK PRICE ====================
  useEffect(() => {
    const fetchPrice = async () => {
      if (!data.symbol) return
      
      // Nếu đã có giá từ props và > 0, không cần fetch
      if (data.currentPrice > 0) {
        setCurrentPrice(data.currentPrice)
        setIsLoadingPrice(false)
        return
      }

      try {
        setIsLoadingPrice(true)
        // Đảm bảo symbol là uppercase
        const symbol = data.symbol.toUpperCase().trim()
        console.log(`💰 Fetching price for ${symbol}...`)
        
        const stockData = await getStockData(symbol)
        if (stockData && stockData.price) {
          console.log(`✅ Price fetched for ${symbol}: ${stockData.price}`)
          setCurrentPrice(stockData.price)
        } else {
          console.warn(`⚠️ No price data for ${symbol}, using fallback`)
          // Nếu không fetch được, giữ giá từ props hoặc 0
          setCurrentPrice(data.currentPrice || 0)
        }
      } catch (error) {
        console.error(`❌ Error fetching stock price for ${data.symbol}:`, error)
        setCurrentPrice(data.currentPrice || 0)
      } finally {
        setIsLoadingPrice(false)
      }
    }

    fetchPrice()
  }, [data.symbol, data.currentPrice])

  // ==================== COMPUTED VALUES ====================
  const availableBalance = profile?.balance ?? reduxUser?.balance ?? 0
  // Chỉ tính totalCost khi có giá và số lượng > 0
  const totalCost = currentPrice > 0 && quantity > 0 ? quantity * currentPrice : 0
  const balanceAfter = availableBalance - totalCost
  const insufficientBalance = totalCost > 0 && totalCost > availableBalance

  // ==================== EFFECTS ====================
  useEffect(() => {
    // Reset khi đổi mã CP
    setStepIndex(0)
    setQuantity(0)
    setOrderType('Market Order')
    setNotes('')
    setTransactionResult(null)
  }, [data.symbol])

  // ==================== HANDLERS ====================
  const handleNext = () => {
    if (stepIndex === 0 && (quantity <= 0 || insufficientBalance)) return
    if (stepIndex === 1 && !orderType) return
    if (stepIndex === 2) {
      handlePlaceOrder()
      return
    }
    setStepIndex((prev) => prev + 1)
  }

  const handlePrevious = () => {
    if (transactionResult) {
      setTransactionResult(null)
      setStepIndex(0)
      setQuantity(0)
      return
    }
    setStepIndex((prev) => Math.max(prev - 1, 0))
  }

  const handlePlaceOrder = async () => {
    if (!reduxUser?._id) {
      setTransactionResult({
        success: false,
        message: 'Vui lòng đăng nhập để đặt lệnh.',
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
      price_per_unit: currentPrice,
      transaction_type: 'BUY' as const,
      notes: notes || `${orderType}`,
    }
    
    try {
      const response = await transactionApi.createTransaction(payload)
      await refetchProfile()

      setTransactionResult({
        success: true,
        message: response.message,
        transaction: response.transaction,
      })
      setStepIndex(3)
    } catch (error) {
      let errorMessage = 'Không thể đặt lệnh, vui lòng thử lại sau.'
      
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as any).message
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
  const progress = ((stepIndex + 1) / 4) * 100
  const isNextDisabled = useMemo(() => {
    if (placingOrder || transactionResult) return true
    if (stepIndex === 0) return quantity <= 0 || insufficientBalance
    if (stepIndex === 1) return !orderType
    return false
  }, [stepIndex, quantity, orderType, insufficientBalance, placingOrder, transactionResult])

  // ==================== RENDER ====================
  
  // Màn kết quả
  if (transactionResult) {
    return (
      <div className="space-y-6">
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

        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-center py-4">
              {transactionResult.success ? (
                <CheckCircle2 className="h-20 w-20 text-success" />
              ) : (
                <XCircle className="h-20 w-20 text-error" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className={`text-2xl font-bold ${transactionResult.success ? 'text-success' : 'text-error'}`}>
                {transactionResult.success ? '✅ Giao dịch thành công!' : '❌ Giao dịch thất bại'}
              </h2>
              <p className="text-muted-foreground">{transactionResult.message}</p>
            </div>

            {transactionResult.success && transactionResult.transaction && (
              <div className="space-y-4 rounded-lg border border-border/60 bg-muted/10 p-4">
                <h3 className="font-semibold text-lg">Chi tiết giao dịch</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Mã cổ phiếu</span>
                    <span className="font-semibold">{transactionResult.transaction.stock_code}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Số lượng</span>
                    <span className="font-semibold">{transactionResult.transaction.quantity.toLocaleString('vi-VN')} CP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Giá/CP</span>
                    <span className="font-semibold">{transactionResult.transaction.price_per_unit.toLocaleString('vi-VN')} VND</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-muted-foreground">Tổng giá trị</span>
                    <span className="font-semibold text-primary">{transactionResult.transaction.total_amount.toLocaleString('vi-VN')} VND</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Số dư sau GD</span>
                    <span className="font-semibold text-success">{transactionResult.transaction.balance_after.toLocaleString('vi-VN')} VND</span>
                  </div>
                  {transactionResult.transaction.transaction_id && (
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-muted-foreground">Mã GD</span>
                      <span className="font-mono text-xs">{transactionResult.transaction.transaction_id}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button onClick={() => {
              setTransactionResult(null)
              setStepIndex(0)
              setQuantity(0)
              setNotes('')
            }} className="w-full">
              Đặt lệnh mới
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Màn wizard
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
          <h1 className="text-2xl font-bold">Mua cổ phiếu {data.symbol}</h1>
          <p className="text-sm text-muted-foreground">
            Giá hiện tại: {isLoadingPrice ? (
              <Loader2 className="h-4 w-4 animate-spin inline ml-2" />
            ) : (
              `${currentPrice.toLocaleString('vi-VN')} VND`
            )}
          </p>
        </div>
      </div>

      {/* Card Bước */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <div className="space-y-2">
            <CardTitle>
              {stepIndex === 0 && 'Bước 1/3: Nhập số lượng'}
              {stepIndex === 1 && 'Bước 2/3: Cấu hình lệnh'}
              {stepIndex === 2 && 'Bước 3/3: Xác nhận giao dịch'}
            </CardTitle>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
              {/* Step 0: Quantity */}
              {stepIndex === 0 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Số lượng cổ phiếu</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="Nhập số lượng"
                      value={quantity || ''}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="h-11"
                    />
                    {quantity > 0 && currentPrice > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Tổng giá trị: <span className="font-semibold text-primary">{totalCost.toLocaleString('vi-VN')} VND</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Số dư sau giao dịch: <span className={insufficientBalance ? 'text-error font-semibold' : 'text-success font-semibold'}>
                            {balanceAfter.toLocaleString('vi-VN')} VND
                          </span>
                        </p>
                      </div>
                    )}
                    {quantity > 0 && currentPrice === 0 && !isLoadingPrice && (
                      <p className="text-sm text-warning">
                        ⚠️ Không thể lấy giá hiện tại. Vui lòng thử lại sau.
                      </p>
                    )}
                  </div>
                  
                  {insufficientBalance && quantity > 0 && (
                    <div className="rounded-lg border border-error bg-error p-4 text-sm text-white">
                      ⚠️ Số dư không đủ! Cần {totalCost.toLocaleString('vi-VN')} VND nhưng chỉ có {availableBalance.toLocaleString('vi-VN')} VND
                    </div>
                  )}
                </div>
              )}

              {/* Step 1: Order Type */}
              {stepIndex === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderType">Loại lệnh</Label>
                    <Select value={orderType} onValueChange={setOrderType}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Chọn loại lệnh" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Market Order">Market Order</SelectItem>
                        <SelectItem value="Limit Order">Limit Order</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
                    <Input
                      id="notes"
                      type="text"
                      placeholder="Thêm ghi chú cho lệnh"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Confirmation */}
              {stepIndex === 2 && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3 text-sm">
                    <h3 className="font-semibold text-base">📋 Tóm tắt lệnh</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mã cổ phiếu</span>
                        <span className="font-semibold">{data.symbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Số lượng</span>
                        <span className="font-semibold">{quantity.toLocaleString('vi-VN')} CP</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Giá/CP</span>
                        <span className="font-semibold">
                          {isLoadingPrice ? (
                            <Loader2 className="h-4 w-4 animate-spin inline" />
                          ) : currentPrice > 0 ? (
                            `${currentPrice.toLocaleString('vi-VN')} VND`
                          ) : (
                            'Đang tải...'
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-muted-foreground font-semibold">Tổng tiền</span>
                        <span className="font-bold text-lg text-primary">
                          {isLoadingPrice || currentPrice === 0 ? (
                            <Loader2 className="h-4 w-4 animate-spin inline" />
                          ) : (
                            `${totalCost.toLocaleString('vi-VN')} VND`
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Loại lệnh</span>
                        <span className="font-semibold">{orderType}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-muted-foreground">Số dư sau giao dịch</span>
                        <span className={`font-semibold ${insufficientBalance ? 'text-error' : 'text-success'}`}>
                          {balanceAfter.toLocaleString('vi-VN')} VND
                        </span>
                      </div>
                      {notes && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ghi chú</span>
                          <span className="font-medium text-right max-w-[60%]">{notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {stepIndex > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 hover:text-primary"
                    disabled={placingOrder}
                    onClick={handlePrevious}
                  >
                    ← Quay lại
                  </Button>
                )}
                <Button 
                  onClick={handleNext} 
                  className="flex-1" 
                  disabled={isNextDisabled}
                >
                  {placingOrder ? (
                    <> Đang xử lý...</>
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
