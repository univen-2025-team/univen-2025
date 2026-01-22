import { useEffect, useRef, useState } from 'react';

/**
 * Animates a number from previous value to target over duration.
 * Uses easeOutQuart for a subtle fintech feel.
 */
export function useCountUp(
    value: number,
    options?: { duration?: number; enabled?: boolean }
): number {
    const { duration = 600, enabled = true } = options ?? {};
    const [display, setDisplay] = useState(0);
    const fromRef = useRef(0);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (!enabled) {
            setDisplay(value);
            fromRef.current = value;
            return;
        }
        const from = fromRef.current;
        fromRef.current = value;
        const start = performance.now();

        const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - (1 - t) ** 4;
            setDisplay(from + (value - from) * eased);
            if (t < 1) {
                rafRef.current = requestAnimationFrame(tick);
            }
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
        };
    }, [value, duration, enabled]);

    return Math.round(display);
}
