'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';

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
    onLoadMore?: (direction: 'left' | 'right') => void;
    onNewsFilter?: (range: { start: string, end: string }) => void;
    onRefresh?: () => void;
    selectedRange?: string;
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
    },
    analysis: {
        bg: 'rgba(251, 191, 36, 0.2)',
        border: '#f59e0b',
    }
};

const TIMELINE_HEIGHT = 50;

export default function CandlestickChart({ data, valueFormatter, onLoadMore, onNewsFilter, onRefresh, selectedRange }: CandlestickChartProps) {
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
    const loadMoreThrottleRef = useRef<number>(0);
    const dragStartWithRightClickRef = useRef<{ x: number, y: number } | null>(null);
    // Selection State (Restored)
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
    const [selectionStartX, setSelectionStartX] = useState(0);

    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);
    
    // Notification state for message sent
    const [messageSentNotification, setMessageSentNotification] = useState(false);

    // State Refs for Event Listeners (Prevent Stale Closures)
    const viewRangeRef = useRef(viewRange);
    const selectionStartXRef = useRef(selectionStartX);
    const isSelectingRef = useRef(isSelecting);
    const isDraggingRef = useRef(isDragging);
    const dragStartRef = useRef(dragStart);
    const dataRef = useRef(data);
    const dimensionsRef = useRef(dimensions);

    // Sync Refs
    useEffect(() => { viewRangeRef.current = viewRange; }, [viewRange]);
    useEffect(() => { selectionStartXRef.current = selectionStartX; }, [selectionStartX]);
    useEffect(() => { isSelectingRef.current = isSelecting; }, [isSelecting]);
    useEffect(() => { isDraggingRef.current = isDragging; }, [isDragging]);
    useEffect(() => { dragStartRef.current = dragStart; }, [dragStart]);
    useEffect(() => { dataRef.current = data; }, [data]);
    useEffect(() => { dimensionsRef.current = dimensions; }, [dimensions]);

    // Stable ref for prop
    const onLoadMoreRef = useRef(onLoadMore);
    useEffect(() => { onLoadMoreRef.current = onLoadMore; }, [onLoadMore]);

    // Constants
    const scrollIntervalRef = useRef<number | null>(null);
    const scrollStartTimeRef = useRef<number>(0);
    const lastDataLengthRef = useRef(0);

    // Track previous data length to adjust view on prepend
    useEffect(() => {
        if (lastDataLengthRef.current > 0 && data.length > lastDataLengthRef.current) {
            const diff = data.length - lastDataLengthRef.current;
            // If we are mostly scrolled to the right, this might be append
            // If we are performing "load more left", we are at start=0

            // Heuristic: If close to 0, it's a prepend
            if (viewRange.start < 50) {
                // Adjust view to keep relative position (prevent jump)
                // UNLESS we are auto-scrolling left (intent is to see new data).
                // Actually, standard behavior for prepend is to shift view index by diff
                setViewRange(prev => ({
                    start: prev.start + diff,
                    end: prev.end + diff
                }));
                // Also adjust selection if it exists
                if (selectionRange) {
                    setSelectionRange(prev => prev ? ({
                        start: prev.start + diff,
                        end: prev.end + diff
                    }) : null);
                    setSelectionStartX(prev => prev + diff);
                }
            }
        }
        lastDataLengthRef.current = data.length;
    }, [data.length]);

    // Constants
    const PADDING = { top: 20, right: 70, bottom: 30, left: 10 };
    const MIN_CANDLES = 10;

    // Initialize view range, smart update on data change
    useEffect(() => {
        if (data.length > 0) {
            // First load or Range Switch (if we assume switching range implies showing all)
            // But we must distinguish initial load vs prepend.
            // Simplified: If selectedRange changes, show all.
            // We handle this in a separate effect below.

            if (viewRange.end === 0) {
                const visibleCount = Math.min(50, data.length);
                setViewRange({
                    start: Math.max(0, data.length - visibleCount),
                    end: data.length - 1
                });
            }
        }
    }, [data.length]);

    // Reset Zoom on Range Change
    useEffect(() => {
        if (data.length > 0) {
            // For larger ranges (1Y, 6M, 3M), showing full range is usually preferred
            // For 1D, maybe showing all is good too (intraday).
            setViewRange({ start: 0, end: data.length - 1 });
        }
    }, [selectedRange, data.length]);

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

        // Draw Vertical Grid Lines based on Range
        if (selectedRange && visibleData.length > 1) {
            ctx.strokeStyle = COLORS.grid;
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();

            visibleData.forEach((candle, i) => {
                if (i === 0) return;
                const prevCandle = visibleData[i - 1];

                // Match logic with string parsing to avoid timezone pitfalls
                const parseDateParts = (timeStr: string) => {
                    const parts = timeStr.split(/[- :T]/);
                    return {
                        year: parseInt(parts[0]),
                        month: parseInt(parts[1]), // 1-12
                        day: parseInt(parts[2]),
                        hour: parseInt(parts[3] || '0'),
                    };
                };

                const curr = parseDateParts(candle.time);
                const prev = parseDateParts(prevCandle.time);

                let isBoundary = false;

                if (selectedRange === '1D') {
                    // 1D: Separator between Morning (< 13:00) and Afternoon (>= 13:00) sessions
                    // Morning typically ends 11:30, Afternoon starts 13:00
                    isBoundary = curr.hour >= 13 && prev.hour < 13;
                } else if (selectedRange === '1W') {
                    // 1W: Separator by DAY
                    isBoundary = curr.day !== prev.day;
                } else if (selectedRange === '1M') {
                    // 1M: Separator by WEEK
                    // Use Date object for day-of-week calculation (safer than manual math)
                    const dCurr = new Date(curr.year, curr.month - 1, curr.day);
                    const dPrev = new Date(prev.year, prev.month - 1, prev.day);
                    const dayDiff = (dCurr.getTime() - dPrev.getTime()) / (1000 * 3600 * 24);
                    // New week if Day < Prev Day (e.g. Mon < Fri) OR significant gap (>4 days)
                    isBoundary = dCurr.getDay() < dPrev.getDay() || dayDiff > 4;
                } else if (selectedRange === '3M' || selectedRange === '6M') {
                    // 3M/6M: Separator by MONTH
                    isBoundary = curr.month !== prev.month;
                } else if (selectedRange === '1Y') {
                    // 1Y: Separator by QUARTER
                    const currQuarter = Math.ceil(curr.month / 3);
                    const prevQuarter = Math.ceil(prev.month / 3);
                    isBoundary = currQuarter !== prevQuarter || curr.year !== prev.year;
                }

                if (isBoundary) {
                    const x = xScale(i) - (chartWidth / visibleData.length) / 2; // Draw between candles
                    ctx.moveTo(x, PADDING.top);
                    ctx.lineTo(x, dimensions.height - PADDING.bottom);
                }
            });
            ctx.stroke();
            ctx.setLineDash([]);
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

        // Draw crosshair if hovering (only when not in selection mode)
        if (!selectionRange && hoveredCandle && mousePos.x > PADDING.left && mousePos.x < dimensions.width - PADDING.right) {
            ctx.strokeStyle = COLORS.crosshair;
            ctx.setLineDash([3, 3]);
            ctx.lineWidth = 1;

            // Calculate Snap X (Center of the hovered candle)
            // Re-calculate index to ensure we snap to the CURRENT rendered data (handle updates)
            const candleWidth = chartWidth / visibleData.length;
            const rawIndex = Math.floor((mousePos.x - PADDING.left) / candleWidth);
            const clampedIndex = Math.max(0, Math.min(visibleData.length - 1, rawIndex));
            const snapX = xScale(clampedIndex);

            // Vertical line (Snapped)
            ctx.beginPath();
            ctx.moveTo(snapX, PADDING.top);
            ctx.lineTo(snapX, dimensions.height - PADDING.bottom);
            ctx.stroke();

            // Horizontal line (Follows mouse exactly for precision)
            ctx.beginPath();
            ctx.moveTo(PADDING.left, mousePos.y);
            ctx.lineTo(dimensions.width - PADDING.right, mousePos.y);
            ctx.stroke();

            ctx.setLineDash([]);
        }

        // Draw selection region for analysis
        if (selectionRange && visibleData.length > 0) {
            const selStart = Math.max(0, selectionRange.start - viewRange.start);
            const selEnd = Math.min(visibleData.length - 1, selectionRange.end - viewRange.start);

            if (selEnd >= selStart && selStart < visibleData.length && selEnd >= 0) {
                const x1 = xScale(selStart) - (chartWidth / visibleData.length) / 2;
                const x2 = xScale(selEnd) + (chartWidth / visibleData.length) / 2;

                ctx.fillStyle = COLORS.analysis.bg;
                ctx.fillRect(x1, PADDING.top, x2 - x1, chartHeight);

                ctx.strokeStyle = COLORS.analysis.border;
                ctx.lineWidth = 2;
                ctx.setLineDash([]);
                ctx.strokeRect(x1, PADDING.top, x2 - x1, chartHeight);
            }
        }

    }, [dimensions, visibleData, yDomain, valueFormatter, hoveredCandle, mousePos, selectionRange, viewRange, selectedRange]);

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
        // Right click to select
        if (e.button === 2) {
            e.preventDefault();
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;

            // Track start position for "click vs drag" check
            dragStartWithRightClickRef.current = { x: e.clientX, y: e.clientY };

            const x = e.clientX - rect.left;
            const chartWidth = dimensions.width - PADDING.left - PADDING.right;
            const candleIndex = Math.floor((x - PADDING.left) / (chartWidth / visibleData.length));
            const globalIndex = viewRange.start + Math.max(0, Math.min(visibleData.length - 1, candleIndex));

            setIsSelecting(true);
            setSelectionStartX(globalIndex);
            setSelectionRange({ start: globalIndex, end: globalIndex });
            setContextMenu(null);
        }
        // Left click to drag/pan
        else if (e.button === 0) {
            setIsDragging(true);
            setContextMenu(null);
            setDragStart({ x: e.clientX, startIdx: viewRange.start });
        }
    }, [viewRange.start, dimensions, visibleData.length]);

    // --- Global Interaction Handlers (FIXED) ---
    useEffect(() => {
        const handleWindowMouseMove = (e: MouseEvent) => {
            if (!isSelectingRef.current && !isDraggingRef.current) return;

            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;

            const x = e.clientX - rect.left;

            const currentDimensions = dimensionsRef.current;
            const currentData = dataRef.current;
            const currentViewRange = viewRangeRef.current;

            const chartWidth = currentDimensions.width - PADDING.left - PADDING.right;
            const visibleLen = currentViewRange.end - currentViewRange.start + 1;

            // 1. Handle Selection (Right Click Drag)
            if (isSelectingRef.current) {
                const clampedX = Math.max(PADDING.left, Math.min(currentDimensions.width - PADDING.right, x));
                const rawIndex = Math.floor((clampedX - PADDING.left) / (chartWidth / visibleLen));
                const globalIndex = currentViewRange.start + Math.max(0, Math.min(visibleLen - 1, rawIndex));

                setSelectionRange({
                    start: Math.min(selectionStartXRef.current, globalIndex),
                    end: Math.max(selectionStartXRef.current, globalIndex)
                });

                // Auto-Scroll Logic for Edges
                const EDGE_THRESHOLD = 50;
                if (x < EDGE_THRESHOLD) {
                    if (!scrollIntervalRef.current) {
                        scrollStartTimeRef.current = Date.now();
                        scrollIntervalRef.current = window.setInterval(() => {
                            const elapsed = Date.now() - scrollStartTimeRef.current;
                            // Accelerate: 1 (start) -> +1 every 200ms -> Max 20 speed
                            const shift = Math.min(20, 1 + Math.floor(elapsed / 200));

                            setViewRange(prev => {
                                if (prev.start <= 0) {
                                    if (onLoadMoreRef.current && (!loadMoreThrottleRef.current || Date.now() - loadMoreThrottleRef.current > 1000)) {
                                        loadMoreThrottleRef.current = Date.now();
                                        onLoadMoreRef.current('left');
                                    }
                                    return prev;
                                }

                                return { start: Math.max(0, prev.start - shift), end: prev.end - shift };
                            });
                            setSelectionRange(prev => {
                                if (!prev) return null;
                                return {
                                    start: Math.min(selectionStartXRef.current, viewRangeRef.current.start),
                                    end: Math.max(selectionStartXRef.current, viewRangeRef.current.end)
                                };
                            });
                        }, 50);
                    }
                } else if (x > currentDimensions.width - EDGE_THRESHOLD) {
                    if (!scrollIntervalRef.current) {
                        scrollStartTimeRef.current = Date.now();
                        scrollIntervalRef.current = window.setInterval(() => {
                            const elapsed = Date.now() - scrollStartTimeRef.current;
                            // Accelerate: 1 (start) -> +1 every 200ms -> Max 20 speed
                            const shift = Math.min(20, 1 + Math.floor(elapsed / 200));

                            setViewRange(prev => {
                                if (prev.end >= dataRef.current.length - 1) {
                                    if (onLoadMoreRef.current && (!loadMoreThrottleRef.current || Date.now() - loadMoreThrottleRef.current > 1000)) {
                                        loadMoreThrottleRef.current = Date.now();
                                        onLoadMoreRef.current('right');
                                    }
                                    return prev;
                                }
                                return { start: prev.start + shift, end: Math.min(dataRef.current.length - 1, prev.end + shift) };
                            });
                        }, 50);
                    }
                } else {
                    if (scrollIntervalRef.current) {
                        clearInterval(scrollIntervalRef.current);
                        scrollIntervalRef.current = null;
                    }
                }
            }
            // 2. Handle Pan Drag (Left Click)
            else if (isDraggingRef.current) {
                const delta = e.clientX - dragStartRef.current.x;
                const pointsToMove = Math.round((delta / chartWidth) * (currentViewRange.end - currentViewRange.start) * -0.5);
                const maxStart = currentData.length - (currentViewRange.end - currentViewRange.start) - 1;

                const newStart = Math.max(0, Math.min(maxStart, dragStartRef.current.startIdx + pointsToMove));
                const range = currentViewRange.end - currentViewRange.start;
                const newEnd = Math.min(currentData.length - 1, newStart + range);

                setViewRange({ start: newStart, end: newEnd });
            }
        };

        const handleWindowMouseUp = (e: MouseEvent) => {
            if (isSelectingRef.current || isDraggingRef.current) {
                if (scrollIntervalRef.current) {
                    clearInterval(scrollIntervalRef.current);
                    scrollIntervalRef.current = null;
                }

                if (e.button === 2 && dragStartWithRightClickRef.current) {
                    const dist = Math.sqrt(
                        Math.pow(e.clientX - dragStartWithRightClickRef.current.x, 2) +
                        Math.pow(e.clientY - dragStartWithRightClickRef.current.y, 2)
                    );
                    if (dist < 5) {
                        setSelectionRange(null);
                        setContextMenu(null);
                    } else {
                        // Drag complete -> Show menu
                        const rect = containerRef.current?.getBoundingClientRect();
                        if (rect) {
                            // Limit X to be within container
                            const x = Math.min(e.clientX, rect.right - 200);
                            // Limit Y to be within viewport/container
                            const y = Math.min(e.clientY, window.innerHeight - 100);
                            setContextMenu({ x, y });
                        }
                    }
                    dragStartWithRightClickRef.current = null;
                }

                setIsDragging(false);
                setIsSelecting(false);
            }
        };

        window.addEventListener('mousemove', handleWindowMouseMove);
        window.addEventListener('mouseup', handleWindowMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleWindowMouseMove);
            window.removeEventListener('mouseup', handleWindowMouseUp);
            if (scrollIntervalRef.current) {
                clearInterval(scrollIntervalRef.current);
                scrollIntervalRef.current = null;
            }
        };
    }, []);

    // Local handler ONLY for hover tooltips
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePos({ x, y });

        const chartWidth = dimensions.width - PADDING.left - PADDING.right;
        const candleWidth = chartWidth / visibleData.length;
        const candleIndex = Math.floor((x - PADDING.left) / candleWidth);

        if (candleIndex >= 0 && candleIndex < visibleData.length) {
            setHoveredCandle(visibleData[candleIndex]);
        } else {
            setHoveredCandle(null);
        }
    }, [dimensions, visibleData]);

    const handleMouseLeave = useCallback(() => {
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

    // Calculate analysis for selected region
    const selectionAnalysis = useMemo(() => {
        if (!selectionRange || selectionRange.start > selectionRange.end) return null;

        const selectedData = data.slice(selectionRange.start, selectionRange.end + 1);
        if (selectedData.length === 0) return null;

        const firstCandle = selectedData[0];
        const lastCandle = selectedData[selectedData.length - 1];
        const lows = selectedData.map(d => d.low);
        const highs = selectedData.map(d => d.high);
        const opens = selectedData.map(d => d.open);
        const closes = selectedData.map(d => d.close);

        const minPrice = Math.min(...lows);
        const maxPrice = Math.max(...highs);
        const priceChange = lastCandle.close - firstCandle.open;
        const priceChangePercent = (priceChange / firstCandle.open) * 100;
        const avgClose = closes.reduce((a, b) => a + b, 0) / closes.length;

        return {
            count: selectedData.length,
            minPrice,
            maxPrice,
            priceChange,
            priceChangePercent,
            avgClose,
            startTime: firstCandle.time,
            endTime: lastCandle.time,
        };
    }, [data, selectionRange]);

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
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                        {viewRange.end - viewRange.start + 1} / {data.length} điểm
                    </span>
                    {selectionRange && (
                        <button
                            onClick={() => setSelectionRange(null)}
                            className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                        >
                            Xóa vùng chọn
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {/* Market Status Indicator */}
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 border border-gray-100 mr-2">
                        <div className={`w-2 h-2 rounded-full ${(() => {
                            const now = new Date();
                            const hours = now.getHours();
                            const minutes = now.getMinutes();
                            const time = hours * 100 + minutes;
                            // Market Hours: 9:00 - 11:30, 13:00 - 14:45
                            const isOpen = (time >= 900 && time <= 1130) || (time >= 1300 && time <= 1445);
                            return isOpen ? 'bg-green-500 animate-pulse' : 'bg-gray-400';
                        })()}`} />
                        <span className="text-xs font-medium text-gray-600">
                            {(() => {
                                const now = new Date();
                                const hours = now.getHours();
                                const minutes = now.getMinutes();
                                const time = hours * 100 + minutes;
                                const isOpen = (time >= 900 && time <= 1130) || (time >= 1300 && time <= 1445);
                                return isOpen ? 'Market Open' : 'Market Closed';
                            })()}
                        </span>
                    </div>

                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                        {onRefresh && (
                            <button onClick={onRefresh} className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors border border-blue-100" title="Làm mới dữ liệu từ máy chủ">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        )}
                        <div className="w-px h-4 bg-gray-200" />
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
                        <button onClick={handleResetZoom} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors" title="Xem toàn bộ dữ liệu (Reset)">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Analysis Panel */}
            {selectionAnalysis && (
                <div className="mb-2 px-1">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <span className="font-semibold text-amber-800">
                                Phân tích vùng ({selectionAnalysis.count} nến)
                            </span>
                            <div className="flex items-center gap-4 text-amber-700">
                                <span>Thấp: <strong className="text-red-600">{valueFormatter(selectionAnalysis.minPrice)}</strong></span>
                                <span>Cao: <strong className="text-green-600">{valueFormatter(selectionAnalysis.maxPrice)}</strong></span>
                                <span>TB: <strong>{valueFormatter(selectionAnalysis.avgClose)}</strong></span>
                                <span>
                                    Biến động:
                                    <strong className={selectionAnalysis.priceChange >= 0 ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                                        {selectionAnalysis.priceChange >= 0 ? '+' : ''}{valueFormatter(selectionAnalysis.priceChange)}
                                        ({selectionAnalysis.priceChangePercent >= 0 ? '+' : ''}{selectionAnalysis.priceChangePercent.toFixed(2)}%)
                                    </strong>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}



            {/* Context Menu */}
            {contextMenu && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden min-w-[180px]"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <div className="py-1">
                        <button
                            className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                                selectionAnalysis && selectionRange
                                    ? 'text-gray-700 hover:bg-gray-100'
                                    : 'text-gray-400 cursor-not-allowed'
                            }`}
                            disabled={!selectionAnalysis || !selectionRange}
                            onClick={() => {
                                if (selectionAnalysis && selectionRange) {
                                    // Lấy dữ liệu từ vùng đã chọn
                                    const selectedData = data.slice(selectionRange.start, selectionRange.end + 1);
                                    
                                    // Format message với thông tin biến động
                                    const message = `Hãy giải thích biến động giá trong khoảng thời gian từ ${selectionAnalysis.startTime} đến ${selectionAnalysis.endTime}:\n\n` +
                                        `- Số lượng nến: ${selectionAnalysis.count}\n` +
                                        `- Giá mở: ${valueFormatter(selectedData[0].open)}\n` +
                                        `- Giá đóng: ${valueFormatter(selectedData[selectedData.length - 1].close)}\n` +
                                        `- Giá thấp nhất: ${valueFormatter(selectionAnalysis.minPrice)}\n` +
                                        `- Giá cao nhất: ${valueFormatter(selectionAnalysis.maxPrice)}\n` +
                                        `- Giá trung bình: ${valueFormatter(selectionAnalysis.avgClose)}\n` +
                                        `- Biến động: ${selectionAnalysis.priceChange >= 0 ? '+' : ''}${valueFormatter(selectionAnalysis.priceChange)} (${selectionAnalysis.priceChangePercent >= 0 ? '+' : ''}${selectionAnalysis.priceChangePercent.toFixed(2)}%)\n\n` +
                                        `Dữ liệu chi tiết các nến:\n${selectedData.map((candle, idx) => 
                                            `${idx + 1}. ${candle.time}: Mở=${valueFormatter(candle.open)}, Đóng=${valueFormatter(candle.close)}, Cao=${valueFormatter(candle.high)}, Thấp=${valueFormatter(candle.low)}`
                                        ).join('\n')}`;

                                    // Chỉ gửi message cho chatbot (không mở chatbot tự động)
                                    const event = new CustomEvent('chatbot:send-message', {
                                        detail: message
                                    });
                                    window.dispatchEvent(event);
                                    
                                    // Hiển thị notification
                                    setMessageSentNotification(true);
                                    setTimeout(() => {
                                        setMessageSentNotification(false);
                                    }, 3000);
                                }
                                setContextMenu(null);
                            }}
                        >
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Giải thích biến động
                        </button>
                        <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            onClick={() => {
                                if (selectionAnalysis && onNewsFilter) {
                                    // Extract dates (YYYY-MM-DD)
                                    // time format is likely "YYYY-MM-DD HH:mm..."
                                    const start = selectionAnalysis.startTime.split(' ')[0];
                                    const end = selectionAnalysis.endTime.split(' ')[0];
                                    onNewsFilter({ start, end });
                                }
                                setContextMenu(null);
                            }}
                        >
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                            Tổng hợp tin tức
                        </button>
                    </div>
                </div>,
                document.body
            )}

            {/* Main Chart Canvas */}
            <div
                ref={containerRef}
                className="flex-1 relative cursor-crosshair select-none min-h-0"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onContextMenu={(e) => e.preventDefault()}
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
            
            {/* Notification khi message đã được gửi */}
            {messageSentNotification && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed bottom-6 right-6 z-[10000] bg-blue-600 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 transition-all duration-300 ease-out opacity-100 translate-y-0"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <div className="font-semibold text-sm">Đã gửi câu hỏi</div>
                        <div className="text-xs text-blue-100">Mở chatbot để xem phản hồi</div>
                    </div>
                    <button
                        onClick={() => setMessageSentNotification(false)}
                        className="ml-2 hover:bg-blue-700 rounded p-1 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>,
                document.body
            )}
        </div>
    );
}
