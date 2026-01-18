import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CandleData } from '../types';
import { Info, Zap } from 'lucide-react';

interface CandlestickChartProps {
  data: CandleData[];
  interactive?: boolean;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({ data, interactive = true }) => {
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);

  // Helper to normalize data for the chart height (0-100%)
  const minPrice = Math.min(...data.map(d => d.low)) * 0.99;
  const maxPrice = Math.max(...data.map(d => d.high)) * 1.01;
  const range = maxPrice - minPrice;

  const getY = (price: number) => ((maxPrice - price) / range) * 100;

  return (
    <div className="relative w-full h-80 bg-fintech-card/50 backdrop-blur-sm border border-fintech-border rounded-xl p-4 overflow-hidden group">
      {/* Grid Lines */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-10 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-full h-px bg-slate-400" />
        ))}
      </div>

      {/* Chart Area */}
      <div className="relative h-full w-full flex items-end justify-between px-2 sm:px-8 gap-1 sm:gap-2">
        {data.map((candle, index) => {
          const isBullish = candle.close >= candle.open;
          const colorClass = isBullish ? 'bg-fintech-bull' : 'bg-fintech-bear';
          const shadowClass = isBullish ? 'shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'shadow-[0_0_10px_rgba(244,63,94,0.3)]';

          const highY = getY(candle.high);
          const lowY = getY(candle.low);
          const openY = getY(candle.open);
          const closeY = getY(candle.close);

          const bodyTop = Math.min(openY, closeY);
          const bodyHeight = Math.abs(openY - closeY);
          const wickTop = highY;
          const wickHeight = lowY - highY;

          return (
            <motion.div
              key={candle.time}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="relative flex-1 h-full flex justify-center group/candle cursor-pointer"
              onMouseEnter={() => interactive && setHoveredCandle(candle)}
              onMouseLeave={() => interactive && setHoveredCandle(null)}
            >
              {/* Wick */}
              <div
                className={`absolute w-[2px] ${isBullish ? 'bg-emerald-500/50' : 'bg-rose-500/50'}`}
                style={{ top: `${wickTop}%`, height: `${wickHeight}%` }}
              />
              {/* Body */}
              <div
                className={`absolute w-full max-w-[12px] sm:max-w-[20px] rounded-sm ${colorClass} ${shadowClass} transition-all duration-200 group-hover/candle:brightness-110`}
                style={{ top: `${bodyTop}%`, height: `${Math.max(bodyHeight, 1)}%` }}
              />

              {/* Event Marker */}
              {candle.event && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  className="absolute -top-2 w-4 h-4 bg-brand-500 rounded-full flex items-center justify-center shadow-lg shadow-brand-500/50 z-10"
                >
                  <Zap size={10} className="text-white fill-current" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Floating Insight Tooltip */}
      <AnimatePresence>
        {hoveredCandle && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-4 right-4 max-w-xs bg-slate-800/90 backdrop-blur-md border border-slate-700 p-3 rounded-lg shadow-xl z-20"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-brand-500/10 rounded-full">
                <Info size={16} className="text-brand-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-mono mb-1">{hoveredCandle.time} • Vol: {hoveredCandle.volume}</p>
                <p className="text-sm font-medium text-slate-100 mb-1">
                  {hoveredCandle.event || (hoveredCandle.close > hoveredCandle.open ? "Bullish Movement" : "Bearish Movement")}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {hoveredCandle.insight || "Normal market fluctuation based on trading volume and short-term sentiment."}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
