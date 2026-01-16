'use client';

import { useState } from "react";

import { formatNumber, formatPrice } from "@/components/market/utils";
import { Button } from "@/components/ui/button";
import { StockDetailData } from "@/lib/types/stock-detail";
import { QuickTradeDialog } from "./QuickTradeDialog";

type StockHeaderCardProps = {
  stock: StockDetailData;
  showRealtimeBadge: boolean;
};

export default function StockHeaderCard({ stock, showRealtimeBadge }: StockHeaderCardProps) {
  const [tradeMode, setTradeMode] = useState<"BUY" | "SELL" | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenTrade = (mode: "BUY" | "SELL") => {
    setTradeMode(mode);
    setDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) setTradeMode(null);
  };

  return (
    <>
      <div className="bg-primary rounded-2xl shadow-xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">{stock.symbol}</h1>
              <span className="text-lg text-primary-foreground/80">{stock.companyName}</span>
              {showRealtimeBadge && (
                <span className="flex items-center text-xs bg-success-light0 px-2 py-1 rounded-full">
                  <span className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></span>
                  Trực tiếp
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-4">
              <p className="text-4xl font-bold">{formatPrice(stock.price)}</p>
              <div className={`text-xl font-semibold ${stock.change >= 0 ? "text-green-300" : "text-red-300"}`}>
                {stock.change > 0 ? "+" : ""}
                {formatNumber(stock.change)}
                <span className="ml-2">
                  ({stock.changePercent > 0 ? "+" : ""}
                  {stock.changePercent}%)
                </span>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button onClick={() => handleOpenTrade("BUY")} className="bg-white text-primary hover:bg-primary/5">
                Mua ngay
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOpenTrade("SELL")}
                className="border-white/60 text-white hover:text-primary hover:bg-white"
              >
                Bán ngay
              </Button>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 w-full md:w-auto">
            <div className="text-sm text-primary-foreground/80 mb-1">Cập nhật lần cuối</div>
            <div className="font-semibold">{new Date(stock.lastUpdate).toLocaleString("vi-VN")}</div>
          </div>
        </div>
      </div>

      {tradeMode && (
        <QuickTradeDialog
          open={dialogOpen}
          onOpenChange={handleDialogChange}
          symbol={stock.symbol}
          companyName={stock.companyName}
          defaultPrice={stock.price}
          mode={tradeMode}
        />
      )}
    </>
  );
}

