"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface StockSearchBarProps {
  symbol?: string;
  onSymbolChange?: (symbol: string) => void;
  className?: string;
}

export function StockSearchBar({
  symbol = "",
  onSymbolChange,
  className,
}: StockSearchBarProps) {
  const [value, setValue] = React.useState(symbol);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onSymbolChange?.(newValue);
  };

  return (
    <div className={cn("relative w-full", className)}>
      <label htmlFor="symbol-search" className="sr-only">
        Symbol
      </label>
      <div className="relative">
        <Input
          id="symbol-search"
          type="text"
          placeholder="Symbol"
          value={value}
          onChange={handleChange}
          className="w-full pl-4 pr-10"
        />
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );
}

