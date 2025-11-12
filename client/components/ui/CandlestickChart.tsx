"use client";

import { useEffect, useState } from "react";
import * as React from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
    ComposedChart,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Bar,
    Cell,
    Line,
    LineChart,
} from "recharts";
import axiosInstance from "@/lib/services/axiosInstance";

type CandleData = {
    timestamp: string | number; // ISO string or unix timestamp
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number; // Trading volume
};

interface CandlestickChartProps {
    symbol?: string; // Stock symbol (e.g., "VIC", "FPT")
    apiEndpoint?: string; // Custom API endpoint, defaults to /api/candles
    onDataLoad?: (latestCandle: CandleData | null) => void; // Callback to pass latest candle data to parent
}

// Custom candlestick shape component
const CandlestickShape = (props: any) => {
    const { x, y, width, payload } = props;
    const { open, high, low, close } = payload;
    const isRising = close >= open;
    const bodyHeight = Math.abs(close - open);
    const bodyY = Math.min(open, close);
    const wickTop = high;
    const wickBottom = low;

    // Calculate positions relative to y-axis scale
    // Note: y-axis in recharts is inverted (top is higher value)
    const scale = props.yAxis?.scale || ((v: number) => v);
    const yHigh = scale(high);
    const yLow = scale(low);
    const yOpen = scale(open);
    const yClose = scale(close);
    const yBodyTop = Math.min(yOpen, yClose);
    const yBodyBottom = Math.max(yOpen, yClose);
    const bodyHeightPx = Math.abs(yBodyBottom - yBodyTop);

    const fillColor = isRising ? "#10b981" : "#ef4444"; // green for rising, red for falling
    const strokeColor = isRising ? "#059669" : "#dc2626";

    return (
        <g>
            {/* Wick (high-low line) */}
            <line
                x1={x + width / 2}
                y1={yHigh}
                x2={x + width / 2}
                y2={yLow}
                stroke={strokeColor}
                strokeWidth={1}
            />
            {/* Body (open-close rectangle) */}
            <rect
                x={x}
                y={yBodyTop}
                width={width}
                height={Math.max(bodyHeightPx, 1)}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={1}
            />
        </g>
    );
};

export default function CandlestickChart({
    symbol,
    apiEndpoint = "/api/candles",
    onDataLoad
}: CandlestickChartProps) {
    const [data, setData] = useState<CandleData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data from server
    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                setError(null);

                // Build the API URL with optional symbol parameter
                let url = apiEndpoint;
                if (symbol) {
                    const separator = apiEndpoint.includes('?') ? '&' : '?';
                    url = `${apiEndpoint}${separator}symbol=${symbol}`;
                }

                // Use axios instance for consistent API calls with auth headers
                const response = await axiosInstance.get(url);

                // Handle different response structures
                const responseData = response.data?.data || response.data || [];

                if (!Array.isArray(responseData)) {
                    throw new Error("Invalid data format: expected an array");
                }

                const formatted = responseData.map((item: any) => ({
                    timestamp: item.timestamp || item.date || item.time,
                    open: Number(item.open),
                    high: Number(item.high),
                    low: Number(item.low),
                    close: Number(item.close),
                    volume: item.volume ? Number(item.volume) : undefined,
                }));

                // Validate that all required fields are present
                const validData = formatted.filter((item: CandleData) =>
                    item.timestamp &&
                    !isNaN(item.open) &&
                    !isNaN(item.high) &&
                    !isNaN(item.low) &&
                    !isNaN(item.close)
                );

                if (validData.length === 0) {
                    throw new Error("No valid candle data received");
                }

                setData(validData);
            } catch (err: any) {
                console.error("Error loading candle data", err);
                setError(err.response?.data?.message || err.message || "Failed to load candle data");
                setData([]); // Clear data on error
            } finally {
                setLoading(false);
            }
        }

        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [symbol, apiEndpoint]);

    // Pass latest candle data to parent component when data changes
    React.useEffect(() => {
        if (data.length > 0 && onDataLoad) {
            const latestCandle = data[data.length - 1];
            onDataLoad(latestCandle);
        }
    }, [data, onDataLoad]);

    if (loading) return <div className="flex items-center justify-center h-[500px]">Loading...</div>;
    if (error) return <div className="flex items-center justify-center h-[500px] text-red-500">Error: {error}</div>;
    if (data.length === 0) return <div className="flex items-center justify-center h-[500px]">No data available</div>;

    return (
        <ChartContainer
            config={{
                open: { label: "Open", color: "#3b82f6" },
                close: { label: "Close", color: "#8b5cf6" },
                high: { label: "High", color: "#10b981" },
                low: { label: "Low", color: "#ef4444" },
            }}
            className="w-full h-[500px]"
        >
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => {
                        if (typeof value === 'string') {
                            return new Date(value).toLocaleDateString();
                        }
                        return value.toString();
                    }}
                />
                <YAxis domain={["auto", "auto"]} />
                {data.some(d => d.volume !== undefined) && (
                    <YAxis yAxisId="volume" orientation="right" domain={["auto", "auto"]} />
                )}
                <Tooltip
                    content={<ChartTooltipContent />}
                    formatter={(value: any, name: string) => {
                        if (name === "candle") {
                            const payload = value;
                            return [
                                <div key="tooltip" className="space-y-1">
                                    <div>Open: {payload.open}</div>
                                    <div>High: {payload.high}</div>
                                    <div>Low: {payload.low}</div>
                                    <div>Close: {payload.close}</div>
                                </div>,
                                "OHLC"
                            ];
                        }
                        return [value, name];
                    }}
                />
                {/* Custom candlestick using Bar with custom shape */}
                <Bar
                    dataKey="high"
                    shape={<CandlestickShape />}
                    isAnimationActive={false}
                />
                {/* Volume bars */}
                {data.some(d => d.volume !== undefined) && (
                    <Bar
                        dataKey="volume"
                        yAxisId="volume"
                        opacity={0.5}
                    >
                        {data.map((entry, index) => {
                            const isRising = entry.close >= entry.open;
                            return (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={isRising ? "#10b981" : "#ef4444"}
                                />
                            );
                        })}
                    </Bar>
                )}
            </ComposedChart>
        </ChartContainer>
    );
}
