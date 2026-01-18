'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Point {
    x: number;
    y: number;
}

interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface UseDragSelectProps {
    onSelectionComplete?: (box: Box) => void;
    onEdgeHover?: (edge: 'top' | 'bottom' | 'left' | 'right') => void;
    containerRef: React.RefObject<HTMLElement | null>;
    edgeThreshold?: number; // Distance from edge to trigger auto-scroll/fetch
}

export function useDragSelect({
    onSelectionComplete,
    onEdgeHover,
    containerRef,
    edgeThreshold = 50
}: UseDragSelectProps) {
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionBox, setSelectionBox] = useState<Box | null>(null);

    // Refs for mutable state accessed in event listeners to avoid stale closures
    // and constant re-attachment of listeners
    const isSelectingRef = useRef(false);
    const startPointRef = useRef<Point | null>(null);
    const suppressContextMenuRef = useRef(false);
    const isMouseDownRef = useRef(false); // Track if mouse is down but not yet selecting

    // Handle mouse down to start selection candidate
    const handleMouseDown = useCallback((e: MouseEvent) => {
        // Only trigger on right click (button 2)
        if (e.button !== 2) return;

        // Ensure click is within container
        const container = containerRef.current;
        if (container && !container.contains(e.target as Node)) return;

        // Note: We do NOT prevent default here immediately if we want to allow normal context menu on click.
        // However, some browsers might fire contextmenu on mousedown.
        // For now, let's allow propagation until we decide it IS a drag.

        const rect = container?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        isMouseDownRef.current = true;
        startPointRef.current = { x, y };

        // Do NOT set isSelecting yet. Wait for move.
    }, [containerRef]);

    // Handle mouse move to update selection
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isMouseDownRef.current || !startPointRef.current || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        // Calculate distance moved
        const deltaX = currentX - startPointRef.current.x;
        const deltaY = currentY - startPointRef.current.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // If not yet selecting, check threshold
        if (!isSelectingRef.current) {
            if (distance > 5) { // 5px threshold
                isSelectingRef.current = true;
                suppressContextMenuRef.current = true;
                setIsSelecting(true);
            } else {
                return; // Hasn't moved enough
            }
        }

        // If we are here, we are selecting
        e.preventDefault();

        // Clamp coordinates
        const x = Math.min(Math.max(0, currentX), rect.width);
        const y = Math.min(Math.max(0, currentY), rect.height);
        const startX = startPointRef.current.x;
        const startY = startPointRef.current.y;

        const newBox = {
            x: Math.min(startX, x),
            y: Math.min(startY, y),
            width: Math.abs(x - startX),
            height: Math.abs(y - startY)
        };

        setSelectionBox(newBox);

        // Check for edge hovering logic (Viewport based)
        if (onEdgeHover) {
            const viewportThreshold = edgeThreshold;

            // Check viewport edges
            if (e.clientY > window.innerHeight - viewportThreshold) {
                onEdgeHover('bottom');
            } else if (e.clientY < viewportThreshold) {
                onEdgeHover('top');
            }

            if (e.clientX > window.innerWidth - viewportThreshold) {
                onEdgeHover('right');
            } else if (e.clientX < viewportThreshold) {
                onEdgeHover('left');
            }
        }

    }, [containerRef, edgeThreshold, onEdgeHover]);

    // Handle mouse up to end selection
    const handleMouseUp = useCallback((e: MouseEvent) => {
        isMouseDownRef.current = false; // Always clear mouse down

        if (!isSelectingRef.current) {
            // If we were mouse down but never started selecting (clicked), clean up
            startPointRef.current = null;
            return;
        }

        // Finalize selection
        isSelectingRef.current = false;
        startPointRef.current = null;

        setIsSelecting(false);
        setSelectionBox(null);

        if (onSelectionComplete && selectionBox) {
            onSelectionComplete(selectionBox);
        }

        // Keep suppressContextMenuRef true for a short delay to block the upcoming contextmenu event
        setTimeout(() => {
            suppressContextMenuRef.current = false;
        }, 100);

    }, [onSelectionComplete, selectionBox]);

    // Prevent context menu during selection
    const handleContextMenu = useCallback((e: MouseEvent) => {
        // Block if currently selecting OR if we just finished selecting (suppression phase)
        if (isSelectingRef.current || suppressContextMenuRef.current) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Mousedown attached to container
        container.addEventListener('mousedown', handleMouseDown);

        // Move/Up attached to window to handle dragging outside
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('contextmenu', handleContextMenu);

        return () => {
            container.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [handleMouseDown, handleMouseMove, handleMouseUp, handleContextMenu, containerRef]);

    return {
        isSelecting,
        selectionBox
    };
}
