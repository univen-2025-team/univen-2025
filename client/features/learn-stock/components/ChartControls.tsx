'use client';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLearnStockStore } from '../stores/useLearnStockStore';
import { RotateCcw } from 'lucide-react';

export type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'All';

interface ChartControlsProps {
    showVolume: boolean;
    setShowVolume: (show: boolean) => void;
    showEvents: boolean;
    setShowEvents: (show: boolean) => void;
    timeRange: TimeRange;
    setTimeRange: (range: TimeRange) => void;
}

export default function ChartControls({
    showVolume,
    setShowVolume,
    showEvents,
    setShowEvents,
    timeRange,
    setTimeRange
}: ChartControlsProps) {
    const { resetFilters, selectedEventDate } = useLearnStockStore();

    const timeRanges: TimeRange[] = ['1M', '3M', '6M', '1Y', 'All'];

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-border">
            <div className="flex items-center gap-1 font-semibold text-lg">
                Price Action & Key Events
            </div>

            <div className="flex flex-wrap items-center gap-4">
                {/* Time Range Selector */}
                <div className="flex bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground rounded-md p-1">
                    {timeRanges.map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
                                range === timeRange
                                    ? 'bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground shadow-sm text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>

                <div className="w-px h-6 bg-border mx-2" />

                <div className="flex items-center space-x-2">
                    <Switch id="show-events" checked={showEvents} onCheckedChange={setShowEvents} />
                    <Label htmlFor="show-events" className="text-sm cursor-pointer">
                        Events
                    </Label>
                </div>

                <div className="flex items-center space-x-2">
                    <Switch id="show-volume" checked={showVolume} onCheckedChange={setShowVolume} />
                    <Label htmlFor="show-volume" className="text-sm cursor-pointer">
                        Volume
                    </Label>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="ml-2 text-muted-foreground hover:text-foreground"
                    title="Reset View"
                >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                </Button>
            </div>
        </div>
    );
}
