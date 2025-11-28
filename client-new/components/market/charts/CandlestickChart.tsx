import { useMemo } from "react";
import {
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    ComposedChart,
    Bar,
    Cell,
    ReferenceLine,
} from "recharts";

type CandleDataPoint = {
    time: string;
    open: number;
    close: number;
    high: number;
    low: number;
};

type CandlestickChartProps = {
    data: CandleDataPoint[];
    valueFormatter: (value: number) => string;
};

const formatTimeLabel = (value: string | number | undefined) => {
    if (!value) {
        return "";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }
    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

type CandleTooltipProps = {
    active?: boolean;
    payload?: Array<{ payload: CandleDataPoint }>;
    label?: string | number;
    valueFormatter: (value: number) => string;
};

const CandleTooltip = ({ active, payload, label, valueFormatter }: CandleTooltipProps) => {
    if (!active || !payload || !payload.length) {
        return null;
    }

    const candle = payload[0].payload as CandleDataPoint;
    const display = (value: number) => valueFormatter(value);

    return (
        <div className="rounded-lg border border-gray-200 bg-white/95 px-3 py-2 text-sm shadow-md">
            <p className="font-semibold text-gray-900">{formatTimeLabel(candle.time)}</p>
            <div className="mt-1 space-y-0.5 text-gray-700">
                <p>Mở cửa: <span className="font-medium text-gray-900">{display(candle.open)}</span></p>
                <p>Đóng cửa: <span className="font-medium text-gray-900">{display(candle.close)}</span></p>
                <p>Cao nhất: <span className="font-medium text-gray-900">{display(candle.high)}</span></p>
                <p>Thấp nhất: <span className="font-medium text-gray-900">{display(candle.low)}</span></p>
            </div>
        </div>
    );
};

export default function CandlestickChart({ data, valueFormatter }: CandlestickChartProps) {
    const processedData = useMemo(
        () =>
            data.map((point) => {
                const isBullish = point.close >= point.open;
                return {
                    ...point,
                    wick: [point.low, point.high],
                    body: [Math.min(point.open, point.close), Math.max(point.open, point.close)],
                    color: isBullish ? "#16a34a" : "#dc2626",
                };
            }),
        [data]
    );

    const xTicks = useMemo(() => {
        if (processedData.length <= 15) {
            return processedData.map((item) => item.time);
        }
        const desiredTicks = 6;
        const step = Math.max(1, Math.floor(processedData.length / desiredTicks));
        const ticks: string[] = [];
        processedData.forEach((item, index) => {
            if (index % step === 0) {
                ticks.push(item.time);
            }
        });
        const last = processedData[processedData.length - 1]?.time;
        if (last && ticks[ticks.length - 1] !== last) {
            ticks.push(last);
        }
        return ticks;
    }, [processedData]);

    const timeReferenceLines = useMemo(() => {
        if (processedData.length <= 1) {
            return [];
        }

        const desiredLines = processedData.length <= 12 ? processedData.length : 6;
        const step = Math.max(1, Math.floor(processedData.length / desiredLines));
        const refs: string[] = [];

        processedData.forEach((item, index) => {
            if (index % step === 0) {
                refs.push(item.time);
            }
        });

        const last = processedData[processedData.length - 1]?.time;
        if (last && refs[refs.length - 1] !== last) {
            refs.push(last);
        }

        return Array.from(new Set(refs));
    }, [processedData]);

    const yDomain = useMemo<[number, number]>(() => {
        if (!data.length) {
            return [0, 1];
        }

        const lows = data.map((d) => d.low);
        const highs = data.map((d) => d.high);
        const minLow = Math.min(...lows);
        const maxHigh = Math.max(...highs);

        if (!Number.isFinite(minLow) || !Number.isFinite(maxHigh)) {
            return [0, 1];
        }

        const padding = (maxHigh - minLow) * 0.1 || Math.max(Math.abs(maxHigh) * 0.01, 1);
        return [minLow - padding, maxHigh + padding];
    }, [data]);

    if (!data.length) {
        return (
            <div className="flex h-72 items-center justify-center text-gray-500">
                Đang thu thập dữ liệu nến...
            </div>
        );
    }

    const lastClose = processedData[processedData.length - 1]?.close;

    const firstTime = processedData[0]?.time;
    const lastTime = processedData[processedData.length - 1]?.time;

    return (
        <div className="flex h-full w-full flex-col">
            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={processedData} margin={{ top: 16, right: 16, left: 16, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            xAxisId="wick"
                            dataKey="time"
                            stroke="#94a3b8"
                            style={{ fontSize: "12px" }}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={24}
                            interval={processedData.length <= 15 ? 0 : undefined}
                            ticks={processedData.length > 15 ? xTicks : undefined}
                            tickFormatter={formatTimeLabel}
                        />
                        <XAxis xAxisId="body" dataKey="time" hide />
                        <YAxis
                            stroke="#6b7280"
                            style={{ fontSize: "12px" }}
                            domain={yDomain}
                            tickFormatter={(value) => valueFormatter(Number(value))}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            cursor={{ stroke: "#9ca3af", strokeDasharray: "3 3" }}
                            content={(props) => (
                                <CandleTooltip
                                    active={props.active}
                                    payload={props.payload as Array<{ payload: CandleDataPoint }> | undefined}
                                    label={props.label}
                                    valueFormatter={valueFormatter}
                                />
                            )}
                        />
                        {timeReferenceLines.map((time) => (
                            <ReferenceLine
                                key={`time-line-${time}`}
                                xAxisId="wick"
                                x={time}
                                stroke="#e2e8f0"
                                strokeDasharray="4 4"
                                strokeOpacity={0.8}
                                label={{
                                    position: "top",
                                    value: formatTimeLabel(time),
                                    fill: "#94a3b8",
                                    fontSize: 10,
                                    dy: -4,
                                }}
                            />
                        ))}
                        <Bar dataKey="wick" xAxisId="wick" barSize={2} isAnimationActive={false}>
                            {processedData.map((entry, index) => (
                                <Cell key={`wick-${entry.time}-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                        <Bar dataKey="body" xAxisId="body" barSize={10} isAnimationActive={false}>
                            {processedData.map((entry, index) => (
                                <Cell key={`body-${entry.time}-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                        {typeof lastClose === "number" && (
                            <ReferenceLine
                                y={lastClose}
                                stroke="#2563eb"
                                strokeDasharray="3 3"
                                label={{
                                    position: "left",
                                    value: valueFormatter(lastClose),
                                    fill: "#2563eb",
                                    fontSize: 12,
                                }}
                            />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

        </div>
    );
}

