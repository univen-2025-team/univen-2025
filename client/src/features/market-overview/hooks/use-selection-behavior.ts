'use client';

import { useState, useCallback, useEffect } from 'react';

interface SelectionBox {
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    left: number;
    top: number;
    width: number;
    height: number;
}

export function useSelectionBehavior() {
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        // Only start selection on left click and if not clicking on interactive elements
        if (e.button !== 0) return;

        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('a') || target.closest('input') || target.closest('.no-select')) {
            return;
        }

        setIsSelecting(true);
        const rect = {
            startX: e.clientX,
            startY: e.clientY,
            currentX: e.clientX,
            currentY: e.clientY,
            left: e.clientX,
            top: e.clientY,
            width: 0,
            height: 0
        };
        setSelectionBox(rect);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isSelecting || !selectionBox) return;

        setSelectionBox(prev => {
            if (!prev) return null;

            const currentX = e.clientX;
            const currentY = e.clientY;

            const left = Math.min(prev.startX, currentX);
            const top = Math.min(prev.startY, currentY);
            const width = Math.abs(currentX - prev.startX);
            const height = Math.abs(currentY - prev.startY);

            return {
                ...prev,
                currentX,
                currentY,
                left,
                top,
                width,
                height
            };
        });
    }, [isSelecting, selectionBox]);

    const handleMouseUp = useCallback(() => {
        if (isSelecting) {
            setIsSelecting(false);
            setSelectionBox(null);
            // Here you could trigger a callback with the final selection area
        }
    }, [isSelecting]);

    useEffect(() => {
        if (isSelecting) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isSelecting, handleMouseMove, handleMouseUp]);

    return {
        isSelecting,
        selectionBox,
        handleMouseDown
    };
}
