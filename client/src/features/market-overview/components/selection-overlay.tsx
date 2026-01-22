'use client';

interface SelectionBox {
    left: number;
    top: number;
    width: number;
    height: number;
}

interface SelectionOverlayProps {
    isSelecting: boolean;
    selectionBox: SelectionBox | null;
    onSelectionComplete?: (box: SelectionBox) => void;
}

export function SelectionOverlay({ isSelecting, selectionBox }: SelectionOverlayProps) {
    if (!isSelecting || !selectionBox) return null;

    return (
        <div
            className="fixed z-50 pointer-events-none border border-indigo-500/50 bg-indigo-500/10 backdrop-blur-[1px]"
            style={{
                left: selectionBox.left,
                top: selectionBox.top,
                width: selectionBox.width,
                height: selectionBox.height,
            }}
        />
    );
}
