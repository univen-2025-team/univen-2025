"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StockActionPanelProps {
  action?: string;
  onActionChange?: (action: string) => void;
  quantity?: number;
  onQuantityChange?: (quantity: number) => void;
  orderType?: string;
  onOrderTypeChange?: (orderType: string) => void;
  onMaxClick?: () => void;
  className?: string;
}

export function StockActionPanel({
  action = "Buy/Sell",
  onActionChange,
  quantity,
  onQuantityChange,
  orderType = "",
  onOrderTypeChange,
  onMaxClick,
  className,
}: StockActionPanelProps) {
  const [localQuantity, setLocalQuantity] = React.useState(
    quantity?.toString() || ""
  );

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQuantity(value);
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      onQuantityChange?.(numValue);
    }
  };

  const handleMaxClick = () => {
    // This would typically fetch max available quantity
    const maxQuantity = 1000; // Placeholder
    setLocalQuantity(maxQuantity.toString());
    onQuantityChange?.(maxQuantity);
    onMaxClick?.();
  };

  return (
    <div className={cn("py-6 space-y-4", className)}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="action" className="text-sm font-medium">
            Action
          </label>
          <Select value={action} onValueChange={onActionChange}>
            <SelectTrigger id="action">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Buy/Sell">Buy/Sell</SelectItem>
              <SelectItem value="Buy">Buy</SelectItem>
              <SelectItem value="Sell">Sell</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="quantity" className="text-sm font-medium">
            Quantity
          </label>
          <div className="flex gap-2">
            <Input
              id="quantity"
              type="number"
              placeholder="Number of stocks"
              value={localQuantity}
              onChange={handleQuantityChange}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleMaxClick}
              className="whitespace-nowrap"
            >
              MAX
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="order-type" className="text-sm font-medium">
            Order Type
          </label>
          <Input
            id="order-type"
            type="text"
            placeholder="Place holder"
            value={orderType}
            onChange={(e) => onOrderTypeChange?.(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

