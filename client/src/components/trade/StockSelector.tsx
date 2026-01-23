"use client"

import { useEffect, useState, useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAllStocks, CachedStockData } from "@/lib/api/market-cache"

interface StockSelectorProps {
    value: string
    onChange: (symbol: string, companyName: string) => void
    disabled?: boolean
    mode?: 'symbol' | 'name' // Cho phép chọn theo mã hoặc tên
    placeholder?: string
    className?: string
}

export default function StockSelector({ 
    value, 
    onChange, 
    disabled,
    mode = 'symbol',
    placeholder,
    className
}: StockSelectorProps) {
    const [stocks, setStocks] = useState<CachedStockData[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchStocks = async () => {
            setIsLoading(true)
            try {
                const data = await getAllStocks()
                // Filter out VN30 index and sort by symbol
                const filteredStocks = data
                    .filter(stock => stock.symbol !== 'VN30')
                    .sort((a, b) => a.symbol.localeCompare(b.symbol))
                setStocks(filteredStocks)
            } catch (error) {
                console.error('Error fetching stocks:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchStocks()
    }, [])

    // Tạo map để lookup nhanh
    const stockMap = useMemo(() => {
        const map = new Map<string, CachedStockData>()
        stocks.forEach(stock => {
            map.set(stock.symbol, stock)
            if (stock.companyName) {
                map.set(stock.companyName, stock)
            }
        })
        return map
    }, [stocks])

    const handleChange = (selectedValue: string) => {
        const stock = stockMap.get(selectedValue)
        if (stock) {
            onChange(stock.symbol, stock.companyName || stock.symbol)
        }
    }

    const defaultPlaceholder = isLoading 
        ? "Đang tải danh sách..." 
        : mode === 'symbol' 
            ? "Chọn mã cổ phiếu" 
            : "Chọn tên cổ phiếu"

    return (
        <Select 
            value={value} 
            onValueChange={handleChange} 
            disabled={disabled || isLoading}
        >
            <SelectTrigger className={className || "w-full bg-white border-gray-300 text-gray-900"}>
                <SelectValue placeholder={placeholder || defaultPlaceholder} />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 text-gray-900 max-h-[300px]">
                {stocks.map((stock) => (
                    <SelectItem 
                        key={stock.symbol} 
                        value={stock.symbol}
                        className="hover:bg-gray-100 focus:bg-gray-100 text-gray-900"
                    >
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{stock.symbol}</span>
                            <span className="text-gray-500">{stock.companyName}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
