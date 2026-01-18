'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';

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

const COLORS = {
    bullish: '#16a34a',
    bearish: '#dc2626',
    grid: '#e5e7eb',
    text: '#6b7280',
    background: '#ffffff',
    crosshair: '#9ca3af',
    timeline: {
        bg: '#f8fafc',
        selection: 'rgba(99, 102, 241, 0.3)',
        border: '#6366f1',
    }
};

const TIMELINE_HEIGHT = 50;

export default function CandlestickChart({ data, valueFormatter }: CandlestickChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const timelineCanvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const timelineContainerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [viewRange, setViewRange] = useState({ start: 0, end: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isTimelineDragging, setIsTimelineDragging] = useState(false);
    const [timelineDragType, setTimelineDragType] = useState<'move' | 'left' | 'right' | null>(null);
    const [dragStart, setDragStart] = useState({ x: 0, startIdx: 0 });
    const [hoveredCandle, setHoveredCandle] = useState<CandleDataPoint | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Constants
    const PADDING = { top: 20, right: 70, bottom: 30, left: 10 };
    const MIN_CANDLES = 10;

    // Initialize view range
    useEffect(() => {
        if (data.length > 0) {
            const visibleCount = Math.min(50, data.length);
            setViewRange({
                start: Math.max(0, data.length - visibleCount),
                end: data.length - 1
            });
        }
    }, [data.length]);

    // Handle resize
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({ width, height });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Visible data
    const visibleData = useMemo(() => {
        return data.slice(viewRange.start, viewRange.end + 1);
    }, [data, viewRange]);

    // Y-axis domain for visible data
    const yDomain = useMemo(() => {
        if (!visibleData.length) return { min: 0, max: 1 };
        const lows = visibleData.map(d => d.low);
        const highs = visibleData.map(d => d.high);
        const min = Math.min(...lows);
        const max = Math.max(...highs);
        const padding = (max - min) * 0.1 || max * 0.01;
        return { min: min - padding, max: max + padding };
    }, [visibleData]);

    // Y-axis domain for all data (timeline)
    const fullYDomain = useMemo(() => {
        if (!data.length) return { min: 0, max: 1 };
        const lows = data.map(d => d.low);
        const highs = data.map(d => d.high);
        const min = Math.min(...lows);
        const max = Math.max(...highs);
        const padding = (max - min) * 0.1 || max * 0.01;
        return { min: min - padding, max: max + padding };
    }, [data]);

    // Draw main chart
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !dimensions.width || !dimensions.height) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = dimensions.width * dpr;
        canvas.height = dimensions.height * dpr;
        ctx.scale(dpr, dpr);

        const chartWidth = dimensions.width - PADDING.left - PADDING.right;
        const chartHeight = dimensions.height - PADDING.top - PADDING.bottom;

        // Clear
        ctx.fillStyle = COLORS.background;
        ctx.fillRect(0, 0, dimensions.width, dimensions.height);

        if (!visibleData.length) {
            ctx.fillStyle = COLORS.text;
            ctx.font = '14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Đang thu thập dữ liệu...', dimensions.width / 2, dimensions.height / 2);
            return;
        }

        // Scale functions
        const xScale = (index: number) => PADDING.left + (index + 0.5) * (chartWidth / visibleData.length);
        const yScale = (value: number) => {
            const ratio = (value - yDomain.min) / (yDomain.max - yDomain.min);
            return PADDING.top + chartHeight * (1 - ratio);
        };

        // Draw grid lines
        ctx.strokeStyle = COLORS.grid;
        ctx.lineWidth = 1;
        const yTicks = 5;
        for (let i = 0; i <= yTicks; i++) {
            const y = PADDING.top + (chartHeight / yTicks) * i;
            ctx.beginPath();
            ctx.setLineDash([3, 3]);
            ctx.moveTo(PADDING.left, y);
            ctx.lineTo(dimensions.width - PADDING.right, y);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        // Draw Y-axis labels
        ctx.fillStyle = COLORS.text;
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'left';
        for (let i = 0; i <= yTicks; i++) {
            const value = yDomain.max - ((yDomain.max - yDomain.min) / yTicks) * i;
            const y = PADDING.top + (chartHeight / yTicks) * i;
            ctx.fillText(valueFormatter(value), dimensions.width - PADDING.right + 5, y + 4);
        }

        // Draw candles
        const candleWidth = Math.max(2, (chartWidth / visibleData.length) * 0.7);
        const wickWidth = 1;

        visibleData.forEach((candle, index) => {
            const x = xScale(index);
            const isBullish = candle.close >= candle.open;
            const color = isBullish ? COLORS.bullish : COLORS.bearish;

            // Draw wick
            ctx.strokeStyle = color;
            ctx.lineWidth = wickWidth;
            ctx.beginPath();
            ctx.moveTo(x, yScale(candle.high));
            ctx.lineTo(x, yScale(candle.low));
            ctx.stroke();

            // Draw body
            const bodyTop = yScale(Math.max(candle.open, candle.close));
            const bodyBottom = yScale(Math.min(candle.open, candle.close));
            const bodyHeight = Math.max(1, bodyBottom - bodyTop);

            ctx.fillStyle = color;
            ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
        });

        // Draw X-axis labels
        const xLabelCount = Math.min(6, visibleData.length);
        const xStep = Math.floor(visibleData.length / xLabelCount);
        ctx.fillStyle = COLORS.text;
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';

        for (let i = 0; i < visibleData.length; i += xStep) {
            const candle = visibleData[i];
            const x = xScale(i);
            let label = candle.time;
            if (label.includes(' ')) {
                label = label.split(' ')[1]?.substring(0, 5) || label;
            }
            ctx.fillText(label, x, dimensions.height - 8);
        }

        // Draw crosshair if hovering
        if (hoveredCandle && mousePos.x > PADDING.left && mousePos.x < dimensions.width - PADDING.right) {
            ctx.strokeStyle = COLORS.crosshair;
            ctx.setLineDash([3, 3]);
            ctx.lineWidth = 1;

            // Vertical line
            ctx.beginPath();
            ctx.moveTo(mousePos.x, PADDING.top);
            ctx.lineTo(mousePos.x, dimensions.height - PADDING.bottom);
            ctx.stroke();

            // Horizontal line
            ctx.beginPath();
            ctx.moveTo(PADDING.left, mousePos.y);
            ctx.lineTo(dimensions.width - PADDING.right, mousePos.y);
            ctx.stroke();

            ctx.setLineDash([]);
        }

    }, [dimensions, visibleData, yDomain, valueFormatter, hoveredCandle, mousePos]);

    // Draw timeline canvas
    useEffect(() => {
        const canvas = timelineCanvasRef.current;
        if (!canvas || !dimensions.width) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = dimensions.width * dpr;
        canvas.height = TIMELINE_HEIGHT * dpr;
        ctx.scale(dpr, dpr);

        const width = dimensions.width;
        const height = TIMELINE_HEIGHT;
        const padding = 5;

        // Clear
        ctx.fillStyle = COLORS.timeline.bg;
        ctx.fillRect(0, 0, width, height);

        if (!data.length) return;

        // Draw mini chart
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2 - 10;
        const barWidth = Math.max(1, chartWidth / data.length);

        data.forEach((candle, index) => {
            const x = padding + (index * chartWidth) / data.length;
            const isBullish = candle.close >= candle.open;
            const color = isBullish ? COLORS.bullish : COLORS.bearish;

            // Draw mini bar (simplified)
            const ratio = (candle.close - fullYDomain.min) / (fullYDomain.max - fullYDomain.min);
            const barHeight = Math.max(1, chartHeight * ratio);
            const y = padding + (chartHeight - barHeight);

            ctx.fillStyle = color;
            ctx.globalAlpha = 0.6;
            ctx.fillRect(x, y, Math.max(1, barWidth - 0.5), barHeight);
        });

        ctx.globalAlpha = 1;

        // Draw selection area
        const selectionStart = padding + (viewRange.start / data.length) * chartWidth;
        const selectionEnd = padding + ((viewRange.end + 1) / data.length) * chartWidth;
        const selectionWidth = selectionEnd - selectionStart;

        // Selection background
        ctx.fillStyle = COLORS.timeline.selection;
        ctx.fillRect(selectionStart, padding, selectionWidth, chartHeight);

        // Selection borders
        ctx.strokeStyle = COLORS.timeline.border;
        ctx.lineWidth = 2;
        ctx.strokeRect(selectionStart, padding, selectionWidth, chartHeight);

        // Draw handles
        const handleWidth = 6;
        ctx.fillStyle = COLORS.timeline.border;
        // Left handle
        ctx.fillRect(selectionStart - handleWidth / 2, padding, handleWidth, chartHeight);
        // Right handle
        ctx.fillRect(selectionEnd - handleWidth / 2, padding, handleWidth, chartHeight);

        // Draw time labels at bottom
        ctx.fillStyle = COLORS.text;
        ctx.font = '9px Inter, sans-serif';
        ctx.textAlign = 'center';

        const labelCount = 4;
        for (let i = 0; i <= labelCount; i++) {
            const idx = Math.floor((i / labelCount) * (data.length - 1));
            const candle = data[idx];
            if (candle) {
                let label = candle.time;
                if (label.includes(' ')) {
                    const [datePart] = label.split(' ');
                    const [, month, day] = datePart.split('-');
                    label = `${day}/${month}`;
                }
                const x = padding + (idx / data.length) * chartWidth;
                ctx.fillText(label, x, height - 2);
            }
        }

    }, [dimensions.width, data, viewRange, fullYDomain]);

    // Mouse wheel zoom
    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 1.15 : 0.87;
        const currentRange = viewRange.end - viewRange.start;
        const newRange = Math.max(MIN_CANDLES, Math.min(data.length, Math.round(currentRange * zoomFactor)));

        const center = (viewRange.start + viewRange.end) / 2;
        const newStart = Math.max(0, Math.round(center - newRange / 2));
        const newEnd = Math.min(data.length - 1, newStart + newRange);

        setViewRange({ start: newStart, end: Math.max(newStart + MIN_CANDLES, newEnd) });
    }, [viewRange, data.length]);

    // Register wheel event
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [handleWheel]);

    // Main canvas mouse handlers
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX, startIdx: viewRange.start });
    }, [viewRange.start]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePos({ x, y });

        // Find hovered candle
        const chartWidth = dimensions.width - PADDING.left - PADDING.right;
        const candleWidth = chartWidth / visibleData.length;
        const candleIndex = Math.floor((x - PADDING.left) / candleWidth);

        if (candleIndex >= 0 && candleIndex < visibleData.length) {
            setHoveredCandle(visibleData[candleIndex]);
        } else {
            setHoveredCandle(null);
        }

        // Handle drag
        if (isDragging) {
            const delta = e.clientX - dragStart.x;
            const pointsToMove = Math.round((delta / chartWidth) * (viewRange.end - viewRange.start) * -0.5);
            const maxStart = data.length - (viewRange.end - viewRange.start) - 1;

            const newStart = Math.max(0, Math.min(maxStart, dragStart.startIdx + pointsToMove));
            const range = viewRange.end - viewRange.start;
            const newEnd = Math.min(data.length - 1, newStart + range);

            setViewRange({ start: newStart, end: newEnd });
        }
    }, [isDragging, dragStart, viewRange, dimensions, visibleData, data.length]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsDragging(false);
        setHoveredCandle(null);
    }, []);

    // Timeline mouse handlers
    const handleTimelineMouseDown = useCallback((e: React.MouseEvent) => {
        const rect = timelineCanvasRef.current?.getBoundingClientRect();
        if (!rect || !data.length) return;

        const x = e.clientX - rect.left;
        const width = rect.width;
        const padding = 5;
        const chartWidth = width - padding * 2;

        const selectionStart = padding + (viewRange.start / data.length) * chartWidth;
        const selectionEnd = padding + ((viewRange.end + 1) / data.length) * chartWidth;

        // Check if clicking on handles
        const handleWidth = 10;
        if (Math.abs(x - selectionStart) < handleWidth) {
            setTimelineDragType('left');
        } else if (Math.abs(x - selectionEnd) < handleWidth) {
            setTimelineDragType('right');
        } else if (x > selectionStart && x < selectionEnd) {
            setTimelineDragType('move');
        } else {
            // Click outside - move selection there
            const clickedIndex = Math.floor(((x - padding) / chartWidth) * data.length);
            const range = viewRange.end - viewRange.start;
            const newStart = Math.max(0, Math.min(data.length - range - 1, clickedIndex - Math.floor(range / 2)));
            const newEnd = Math.min(data.length - 1, newStart + range);
            setViewRange({ start: newStart, end: newEnd });
            return;
        }

        setIsTimelineDragging(true);
        setDragStart({ x: e.clientX, startIdx: viewRange.start });
    }, [viewRange, data.length]);

    const handleTimelineMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isTimelineDragging || !timelineDragType) return;

        const rect = timelineCanvasRef.current?.getBoundingClientRect();
        if (!rect || !data.length) return;

        const deltaX = e.clientX - dragStart.x;
        const chartWidth = rect.width - 10;
        const deltaIndex = Math.round((deltaX / chartWidth) * data.length);
        const range = viewRange.end - viewRange.start;

        if (timelineDragType === 'move') {
            const newStart = Math.max(0, Math.min(data.length - range - 1, dragStart.startIdx + deltaIndex));
            const newEnd = Math.min(data.length - 1, newStart + range);
            setViewRange({ start: newStart, end: newEnd });
        } else if (timelineDragType === 'left') {
            const newStart = Math.max(0, Math.min(viewRange.end - MIN_CANDLES, dragStart.startIdx + deltaIndex));
            setViewRange(prev => ({ ...prev, start: newStart }));
        } else if (timelineDragType === 'right') {
            const startEnd = dragStart.startIdx + range;
            const newEnd = Math.max(viewRange.start + MIN_CANDLES, Math.min(data.length - 1, startEnd + deltaIndex));
            setViewRange(prev => ({ ...prev, end: newEnd }));
        }
    }, [isTimelineDragging, timelineDragType, dragStart, viewRange, data.length]);

    const handleTimelineMouseUp = useCallback(() => {
        setIsTimelineDragging(false);
        setTimelineDragType(null);
    }, []);

    // Zoom controls
    const handleZoomIn = useCallback(() => {
        const currentRange = viewRange.end - viewRange.start;
        const newRange = Math.max(MIN_CANDLES, Math.round(currentRange * 0.7));
        const center = (viewRange.start + viewRange.end) / 2;
        const newStart = Math.max(0, Math.round(center - newRange / 2));
        const newEnd = Math.min(data.length - 1, newStart + newRange);
        setViewRange({ start: newStart, end: newEnd });
    }, [viewRange, data.length]);

    const handleZoomOut = useCallback(() => {
        const currentRange = viewRange.end - viewRange.start;
        const newRange = Math.min(data.length, Math.round(currentRange * 1.4));
        const center = (viewRange.start + viewRange.end) / 2;
        const newStart = Math.max(0, Math.round(center - newRange / 2));
        const newEnd = Math.min(data.length - 1, newStart + newRange);
        setViewRange({ start: newStart, end: newEnd });
    }, [viewRange, data.length]);

    const handleResetZoom = useCallback(() => {
        setViewRange({ start: 0, end: data.length - 1 });
    }, [data.length]);

    // Format tooltip time
    const formatTooltipTime = (time: string) => {
        if (time && time.includes(' ')) {
            const [datePart, timePart] = time.split(' ');
            const [year, month, day] = datePart.split('-');
            return `${day}/${month}/${year} ${timePart?.substring(0, 5) || ''}`;
        }
        return time;
    };

    if (!data.length) {
        return (
            <div className="flex h-full items-center justify-center text-gray-500">
                Đang thu thập dữ liệu nến...
            </div>
        );
    }

    return (
        <div className="flex h-full w-full flex-col">
            {/* Controls */}
            <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs text-gray-400">
                    {viewRange.end - viewRange.start + 1} / {data.length} điểm
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 hidden sm:block">Cuộn chuột để zoom</span>
                    <button onClick={handleZoomIn} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors" title="Phóng to">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        </svg>
                    </button>
                    <button onClick={handleZoomOut} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors" title="Thu nhỏ">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                        </svg>
                    </button>
                    <button onClick={handleResetZoom} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors" title="Đặt lại">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Main Chart Canvas */}
            <div
                ref={containerRef}
                className="flex-1 relative cursor-crosshair select-none min-h-0"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            >
                <canvas
                    ref={canvasRef}
                    style={{ width: '100%', height: '100%' }}
                />

                {/* Tooltip */}
                {hoveredCandle && (
                    <div
                        className="absolute bg-white/95 border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-lg pointer-events-none z-10"
                        style={{
                            left: Math.min(mousePos.x + 15, dimensions.width - 160),
                            top: Math.max(mousePos.y - 100, 10),
                        }}
                    >
                        <p className="font-semibold text-gray-900 mb-1">{formatTooltipTime(hoveredCandle.time)}</p>
                        <div className="space-y-0.5 text-gray-700 text-xs">
                            <p>Mở: <span className="font-medium text-gray-900">{valueFormatter(hoveredCandle.open)}</span></p>
                            <p>Đóng: <span className="font-medium text-gray-900">{valueFormatter(hoveredCandle.close)}</span></p>
                            <p>Cao: <span className="font-medium text-gray-900">{valueFormatter(hoveredCandle.high)}</span></p>
                            <p>Thấp: <span className="font-medium text-gray-900">{valueFormatter(hoveredCandle.low)}</span></p>
                        </div>
                    </div>
                )}
            </div>

            {/* Timeline Navigator Canvas */}
            <div
                ref={timelineContainerRef}
                className="w-full cursor-ew-resize select-none border-t border-gray-200"
                style={{ height: TIMELINE_HEIGHT }}
                onMouseDown={handleTimelineMouseDown}
                onMouseMove={handleTimelineMouseMove}
                onMouseUp={handleTimelineMouseUp}
                onMouseLeave={handleTimelineMouseUp}
            >
                <canvas
                    ref={timelineCanvasRef}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
        </div>
    );
}
