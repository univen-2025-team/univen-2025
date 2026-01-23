'use client'

import { useState, useEffect } from 'react'
import { FeatureState, FeatureInstruction } from '../types/features'
import { MarketOverviewFeature } from '../market-overview/components/market-overview-feature'
import { BuyStockWizard } from '../buy-stock/components/buy-stock-wizard'
import { SellStockFeature } from '../sell-stock/components/sell-stock-feature'
import { StockDetailFeature } from '../stock-detail/components/stock-detail-feature'
import { NewsFeature } from '../news/news-feature'
import { StockSuggestionsFeature } from '../stock-suggestions/components/stock-suggestions-feature'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle2, User, History, TrendingUp, Trophy, Loader2 } from 'lucide-react'
import { useAppSelector } from '@/lib/store/hooks'
import { selectUser } from '@/lib/store/authSlice'
import { userApi } from '@/lib/api/user.api'
import { transactionApi } from '@/lib/api/transaction.api'
import { getStockData } from '@/lib/api/market-cache'
import { usePortfolioCalculator } from '@/components/portfolio/hooks/use-portfolio-calculator'

type FeatureAreaProps = {
  state: FeatureState
  onBack?: () => void
  onFeatureAction?: (instruction: FeatureInstruction) => void
}

// Sell Stock Feature Wrapper - Tự fetch data từ API
function SellStockFeatureWrapper({ data, onBack }: { data: any; onBack?: () => void }) {
  const user = useAppSelector(selectUser)
  const { calculatePortfolio } = usePortfolioCalculator()
  const [stockPrice, setStockPrice] = useState(data.currentPrice || 0)
  const [availableQuantity, setAvailableQuantity] = useState(data.availableQuantity || 0)
  const [averageBuyPrice, setAverageBuyPrice] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!data.symbol || !user?._id) {
        setIsLoading(false)
        return
      }

      try {
        // Fetch stock price - đảm bảo symbol là uppercase
        const symbol = data.symbol.toUpperCase().trim()
        console.log(`💰 Fetching sell stock data for ${symbol}...`)
        const stockData = await getStockData(symbol)
        if (stockData && stockData.price) {
          console.log(`✅ Price fetched for ${symbol}: ${stockData.price}`)
          setStockPrice(stockData.price)
        } else {
          console.warn(`⚠️ No price data for ${symbol}`)
        }

        // Fetch user holdings để lấy availableQuantity và averageBuyPrice
        const { holdings } = await calculatePortfolio(user._id)
        const holding = holdings.find((h: any) => h.stock_code === data.symbol)
        
        if (holding) {
          setAvailableQuantity(holding.quantity)
          setAverageBuyPrice(holding.avg_buy_price)
        } else {
          setAvailableQuantity(0)
        }
      } catch (error) {
        console.error('Error fetching sell stock data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [data.symbol, user?._id, calculatePortfolio])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Đang tải dữ liệu...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <SellStockFeature
      data={{
        symbol: data.symbol,
        currentPrice: stockPrice,
        holdingQuantity: availableQuantity,
        averageBuyPrice,
        companyName: data.symbol,
      }}
      onBack={onBack}
    />
  )
}

function ConfirmTransactionFeature({ data, onBack }: { data: any; onBack?: () => void }) {
  // Hiển thị thông tin từ payload, không cần fetch thêm
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Xác nhận giao dịch
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.transactionId && (
            <div>
              <p className="text-sm text-muted-foreground">Mã giao dịch</p>
              <p className="font-mono text-lg">{data.transactionId}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Mã cổ phiếu</p>
              <p className="text-lg font-semibold">{data.symbol}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Loại</p>
              <p className="text-lg font-semibold">{data.type === 'buy' ? 'Mua' : 'Bán'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Số lượng</p>
              <p className="text-lg font-semibold">{data.quantity}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Giá</p>
              <p className="text-lg font-semibold">{data.price?.toLocaleString('vi-VN')} VNĐ</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Tổng tiền</p>
              <p className="text-2xl font-bold text-primary">
                {data.totalAmount?.toLocaleString('vi-VN')} VNĐ
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function UserProfileFeature({ data, onBack }: { data: any; onBack?: () => void }) {
  const user = useAppSelector(selectUser)
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userProfile = await userApi.getProfile()
        setProfile(userProfile)
      } catch (error) {
        console.error('Error fetching user profile:', error)
        // Fallback to Redux user data
        if (user) {
          setProfile({
            user_fullName: user.user_fullName,
            email: user.email,
            balance: user.balance,
            user_avatar: user.user_avatar,
          })
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Đang tải thông tin...</span>
        </CardContent>
      </Card>
    )
  }

  const displayProfile = profile || data

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Thông tin tài khoản
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayProfile?.user_avatar && (
            <div className="flex justify-center">
              <img
                src={displayProfile.user_avatar}
                alt="Avatar"
                className="w-24 h-24 rounded-full"
              />
            </div>
          )}
          {(displayProfile?.user_fullName || displayProfile?.fullName) && (
            <div>
              <p className="text-sm text-muted-foreground">Họ tên</p>
              <p className="text-lg font-semibold">
                {displayProfile.user_fullName || displayProfile.fullName}
              </p>
            </div>
          )}
          {(displayProfile?.email || displayProfile?.user_email) && (
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-lg">{displayProfile.email || displayProfile.user_email}</p>
            </div>
          )}
          {(displayProfile?.balance !== undefined) && (
            <div>
              <p className="text-sm text-muted-foreground">Số dư</p>
              <p className="text-2xl font-bold text-primary">
                {displayProfile.balance.toLocaleString('vi-VN')} VNĐ
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function TransactionHistoryFeature({ data, onBack }: { data: any; onBack?: () => void }) {
  const user = useAppSelector(selectUser)
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      const userId = data?.userId || user?._id
      console.log('📊 Fetching transaction history for userId:', userId)
      
      if (!userId) {
        console.warn('⚠️ No userId provided for transaction history')
        setIsLoading(false)
        return
      }

      try {
        console.log('📡 Calling transactionApi.getTransactionHistory...')
        const response = await transactionApi.getTransactionHistory(userId, {
          pagination: { page: 1, limit: 50 }
        })
        console.log('✅ Transaction history response:', response)
        setTransactions(response.transactions || [])
      } catch (error) {
        console.log('❌ Error fetching transaction history:', error)
        console.log('❌ Error details:', error instanceof Error ? error.message : String(error))
        setTransactions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [data?.userId, user?._id])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Đang tải lịch sử...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Lịch sử giao dịch
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {transactions.length > 0 ? (
            transactions.map((txn: any, idx: number) => (
              <div key={idx} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{txn.stock_code || txn.symbol || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">
                      {txn.transaction_type === 'BUY' ? 'Mua' : 'Bán'} • {txn.quantity || 0} cổ phiếu
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {txn.price_per_unit?.toLocaleString('vi-VN')} VNĐ
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {txn.status || 'N/A'}
                    </p>
                  </div>
                </div>
                {txn.createdAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(txn.createdAt).toLocaleString('vi-VN')}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Chưa có giao dịch nào
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function TransactionStatsFeature({ data, onBack }: { data: any; onBack?: () => void }) {
  const user = useAppSelector(selectUser)
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const userId = data?.userId || user?._id
      console.log('📈 Fetching transaction stats for userId:', userId)
      
      if (!userId) {
        console.warn('⚠️ No userId provided for transaction stats')
        setIsLoading(false)
        return
      }

      try {
        console.log('📡 Calling transactionApi.getUserTransactionStats...')
        const response = await transactionApi.getUserTransactionStats(userId)
        console.log('✅ Transaction stats response:', response)
        setStats(response)
      } catch (error) {
        console.log('❌ Error fetching transaction stats:', error)
        console.log('❌ Error details:', error instanceof Error ? error.message : String(error))
        setStats(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [data?.userId, user?._id])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Đang tải thống kê...</span>
        </CardContent>
      </Card>
    )
  }

  const displayStats = stats || data

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Thống kê giao dịch
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayStats?.totalProfit !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground">Tổng lợi nhuận</p>
              <p className={`text-2xl font-bold ${displayStats.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {displayStats.totalProfit >= 0 ? '+' : ''}
                {displayStats.totalProfit.toLocaleString('vi-VN')} VNĐ
              </p>
            </div>
          )}
          {displayStats?.totalTransactions !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground">Tổng số giao dịch</p>
              <p className="text-xl font-semibold">{displayStats.totalTransactions}</p>
            </div>
          )}
          {displayStats?.winRate !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground">Tỷ lệ thắng</p>
              <p className="text-xl font-semibold">{(displayStats.winRate * 100).toFixed(1)}%</p>
            </div>
          )}
          {!displayStats && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Chưa có dữ liệu thống kê
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function RankingFeature({ data, onBack }: { data: any; onBack?: () => void }) {
  const user = useAppSelector(selectUser)
  const [rankings, setRankings] = useState<any[]>([])
  const [userRank, setUserRank] = useState<number | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRanking = async () => {
      console.log('🏆 Fetching ranking data...')
      try {
        console.log('📡 Calling transactionApi.getUserRanking...')
        const response = await transactionApi.getUserRanking({
          page: 1,
          limit: 20
        })
        console.log('✅ Ranking response:', response)
        setRankings(response.ranking || [])

        // Tìm user rank
        if (user?.user_fullName) {
          const rankIndex = response.ranking.findIndex(
            (r: any) => r.user_fullName === user.user_fullName
          )
          if (rankIndex !== -1) {
            setUserRank(rankIndex + 1)
            console.log('✅ User rank found:', rankIndex + 1)
          }
        }
      } catch (error) {
        console.log('❌ Error fetching ranking:', error)
        console.log('❌ Error details:', error instanceof Error ? error.message : String(error))
        setRankings([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRanking()
  }, [user?.user_fullName])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Đang tải xếp hạng...</span>
        </CardContent>
      </Card>
    )
  }

  const displayRankings = rankings.length > 0 ? rankings : (data?.rankings || [])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Bảng xếp hạng
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {displayRankings.length > 0 ? (
            <>
              {displayRankings.map((rank: any, idx: number) => {
                const profit = rank.total_profit ?? rank.profit ?? 0
                const isPositive = profit >= 0
                return (
                <div key={idx} className="p-3 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg w-8">#{idx + 1}</span>
                    <div>
                      <p className="font-semibold">
                        {rank.user_fullName || rank.name || rank.userId || 'N/A'}
                      </p>
                      <p className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}{profit.toLocaleString('vi-VN')} VNĐ
                      </p>
                    </div>
                  </div>
                </div>
              )})}
              {(userRank !== undefined || data?.userRank !== undefined) && (
                <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Xếp hạng của bạn</p>
                  <p className="text-xl font-bold">#{userRank || data?.userRank}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Chưa có dữ liệu xếp hạng
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function FeatureArea({
  state,
  onBack,
  onFeatureAction,
}: FeatureAreaProps) {
  const handleBuyClick = (symbol: string) => {
    if (!onFeatureAction) return

    onFeatureAction({
      type: 'OPEN_BUY_STOCK',
      payload: {
        symbol,
        currentPrice: 0, // TODO: fetch giá thật
        steps: [],
      },
    })
  }

  switch (state.activeFeature) {
    case 'MARKET_OVERVIEW':
      return <MarketOverviewFeature data={state.marketOverview} />

    case 'BUY_STOCK':
      return state.buyStock ? (
        <BuyStockWizard data={state.buyStock} onBack={onBack} />
      ) : (
        <MarketOverviewFeature data={state.marketOverview} />
      )

    case 'SELL_STOCK':
      return state.sellStock ? (
        <SellStockFeatureWrapper data={state.sellStock} onBack={onBack} />
      ) : (
        <MarketOverviewFeature data={state.marketOverview} />
      )

    case 'VIEW_STOCK_DETAIL':
      return state.stockDetail ? (
        <StockDetailFeature
          data={state.stockDetail}
          onBack={onBack}
          onBuyClick={handleBuyClick}
        />
      ) : (
        <MarketOverviewFeature data={state.marketOverview} />
      )

    case 'VIEW_NEWS':
      return state.news ? (
        <NewsFeature data={state.news} onBack={onBack} />
      ) : (
        <MarketOverviewFeature data={state.marketOverview} />
      )

    case 'CONFIRM_TRANSACTION':
      return state.transaction ? (
        <ConfirmTransactionFeature data={state.transaction} onBack={onBack} />
      ) : (
        <MarketOverviewFeature data={state.marketOverview} />
      )

    case 'USER_PROFILE':
      return state.userProfile ? (
        <UserProfileFeature data={state.userProfile} onBack={onBack} />
      ) : (
        <MarketOverviewFeature data={state.marketOverview} />
      )

    case 'TRANSACTION_HISTORY':
      return state.transactionHistory ? (
        <TransactionHistoryFeature data={state.transactionHistory} onBack={onBack} />
      ) : (
        <MarketOverviewFeature data={state.marketOverview} />
      )

    case 'TRANSACTION_STATS':
      return state.transactionStats ? (
        <TransactionStatsFeature data={state.transactionStats} onBack={onBack} />
      ) : (
        <MarketOverviewFeature data={state.marketOverview} />
      )

    case 'RANKING':
      return state.ranking ? (
        <RankingFeature data={state.ranking} onBack={onBack} />
      ) : (
        <MarketOverviewFeature data={state.marketOverview} />
      )

    case 'STOCK_SUGGESTIONS':
      return state.stockSuggestions ? (
        <StockSuggestionsFeature
          symbols={state.stockSuggestions.symbols}
          onStockClick={(symbol) => {
            // Khi click vào stock, tạo OPEN_STOCK_DETAIL effect
            if (onFeatureAction) {
              onFeatureAction({
                type: 'OPEN_STOCK_DETAIL',
                payload: {
                  symbol,
                  name: `${symbol} Corporation`,
                  description: `Thông tin chi tiết về cổ phiếu ${symbol}`,
                  price: 0,
                  changePercent: 0,
                  intradayChart: [],
                },
              })
            }
          }}
        />
      ) : (
        <MarketOverviewFeature data={state.marketOverview} />
      )

    default:
      return <MarketOverviewFeature data={state.marketOverview} />
  }
}
