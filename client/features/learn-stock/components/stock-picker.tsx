"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const stocks = [
  { symbol: "HPG", name: "Hòa Phát Group" },
  { symbol: "VNM", name: "Vinamilk" },
  { symbol: "FPT", name: "FPT Corp" },
  { symbol: "VIC", name: "Vingroup" },
]

interface StockPickerProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export default function StockPicker({ value, onChange, disabled }: StockPickerProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full bg-input border-border">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {stocks.map((stock) => (
          <SelectItem key={stock.symbol} value={stock.symbol}>
            <span className="font-semibold">{stock.symbol}</span>
            <span className="text-muted-foreground ml-2">{stock.name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
