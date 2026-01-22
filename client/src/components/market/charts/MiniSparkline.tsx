'use client';

import { useMemo } from 'react';

interface MiniSparklineProps {
    /**
     * Change percentage (e.g., +2.5 or -1.3)
     * Used to determine trend direction and generate visual pattern
     */
    changePercent: number;
    /**
     * Width of the sparkline in pixels
     */
    width?: number;
    /**
     * Height of the sparkline in pixels
     */
    height?: number;
    /**
     * Optional className for the container
     */
    className?: string;
}

/**
 * A minimal sparkline chart that shows trend direction
 * Uses the change percentage to generate a visual representation
 */
export function MiniSparkline({
    changePercent,
    width = 60,
    height = 24,
    className = ''
}: MiniSparklineProps) {
    // Generate a trend line based on change percentage
    const pathData = useMemo(() => {
        const points: number[] = [];
        const numPoints = 12;
        const midY = height / 2;
        const amplitude = height * 0.35;

        // Generate points that trend in the direction of change
        const trend = changePercent > 0 ? -1 : changePercent < 0 ? 1 : 0; // Up = negative Y, Down = positive Y
        const trendStrength = Math.min(Math.abs(changePercent) / 5, 1); // Normalize to 0-1

        // Create a seed from changePercent for consistent randomization
        const seed = Math.abs(changePercent * 1000) % 100;

        for (let i = 0; i < numPoints; i++) {
            const progress = i / (numPoints - 1); // 0 to 1

            // Base trend line
            const trendOffset = trend * progress * amplitude * trendStrength;

            // Add some variation (but consistent based on seed)
            const variation = Math.sin((i + seed) * 0.8) * amplitude * 0.3;

            const y = midY + trendOffset + variation;
            points.push(Math.max(2, Math.min(height - 2, y)));
        }

        // Generate SVG path
        const stepX = width / (numPoints - 1);
        const pathParts = points.map((y, i) => {
            const x = i * stepX;
            return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
        });

        return pathParts.join(' ');
    }, [changePercent, width, height]);

    // Determine color based on change
    const strokeColor = changePercent > 0
        ? '#6366f1' // indigo-500 for up
        : changePercent < 0
            ? '#ef4444' // red-500 for down
            : '#f59e0b'; // amber-500 for no change

    const bgGradientId = `sparkline-bg-${changePercent.toString().replace('.', '-')}`;

    return (
        <svg
            width={width}
            height={height}
            className={className}
            viewBox={`0 0 ${width} ${height}`}
        >
            {/* Background gradient fill */}
            <defs>
                <linearGradient id={bgGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={strokeColor} stopOpacity="0.15" />
                    <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Area fill */}
            <path
                d={`${pathData} L ${width} ${height} L 0 ${height} Z`}
                fill={`url(#${bgGradientId})`}
            />

            {/* Line */}
            <path
                d={pathData}
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default MiniSparkline;
