"use client"

import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAllStocks, CachedStockData } from "@/lib/api/market-cache"

interface StockPickerProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export default function StockPicker({ value, onChange, disabled }: StockPickerProps) {
  const [stocks, setStocks] = useState<CachedStockData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStocks = async () => {
      console.log('🔍 StockPicker: Starting to fetch stocks...');
      setIsLoading(true)
      try {
        const data = await getAllStocks()
        console.log('🔍 StockPicker: Received data:', data.length, 'stocks');
        // Filter out VN30 index and sort by symbol
        const filteredStocks = data
          .filter(stock => stock.symbol !== 'VN30')
          .sort((a, b) => a.symbol.localeCompare(b.symbol))
        console.log('🔍 StockPicker: Filtered stocks:', filteredStocks.length);
        setStocks(filteredStocks)
      } catch (error) {
        console.error('Error fetching stocks:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStocks()
  }, [])

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isLoading}>
      <SelectTrigger className="w-full bg-input border-border">
        <SelectValue placeholder={isLoading ? "Loading stocks..." : "Select a stock"} />
      </SelectTrigger>
      <SelectContent>
        {stocks.map((stock) => (
          <SelectItem key={stock.symbol} value={stock.symbol}>
            <span className="font-semibold">{stock.symbol}</span>
            <span className="text-muted-foreground ml-2">{stock.companyName}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
