/**
 * Date utilities for stock trading date calculations
 */

import { format, subDays, getDay } from 'date-fns';

/**
 * Get the latest trading date based on current date logic:
 * - Saturday (6) or Sunday (0): return Friday
 * - Weekdays: return previous day
 * 
 * @param referenceDate The reference date (defaults to today)
 * @returns Date string in 'yyyy-MM-dd' format
 */
export function getLatestTradingDate(referenceDate?: Date): string {
    const ref = referenceDate || new Date();
    const dayOfWeek = getDay(ref); // 0 = Sunday, 6 = Saturday

    let targetDate: Date;

    if (dayOfWeek === 0) {
        // Sunday -> Friday (2 days back)
        targetDate = subDays(ref, 2);
    } else if (dayOfWeek === 6) {
        // Saturday -> Friday (1 day back)
        targetDate = subDays(ref, 1);
    } else if (dayOfWeek === 1) {
        // Monday -> Friday (3 days back) - Avoids returning Sunday
        targetDate = subDays(ref, 3);
    } else {
        // Tuesday-Friday -> previous day
        targetDate = subDays(ref, 1);
    }

    return format(targetDate, 'yyyy-MM-dd');
}

/**
 * Calculate date range for filters (1W, 1M, 3M, 6M, 1Y, etc.)
 * End date is calculated using getLatestTradingDate()
 * 
 * @param filter Filter type: '1W', '1M', '3M', '6M', '1Y', 'YTD'
 * @param referenceDate The reference date (defaults to today)
 * @returns Object with start and end dates in 'yyyy-MM-dd' format
 */
export function getDateRangeForFilter(filter: string, referenceDate?: Date): { start: string; end: string } {
    const ref = referenceDate || new Date();
    const endDate = getLatestTradingDate(ref);
    const endDateObj = new Date(endDate);

    let startDateObj: Date;

    switch (filter.toUpperCase()) {
        case '1D':
            // Single day: start = end
            startDateObj = endDateObj;
            break;
        case '1W':
            // 1 week = 7 days back from end date
            startDateObj = subDays(endDateObj, 7);
            break;
        case '1M':
            // 1 month = 30 days back
            startDateObj = subDays(endDateObj, 30);
            break;
        case '3M':
            // 3 months = 90 days back
            startDateObj = subDays(endDateObj, 90);
            break;
        case '6M':
            // 6 months = 180 days back
            startDateObj = subDays(endDateObj, 180);
            break;
        case '1Y':
            // 1 year = 365 days back
            startDateObj = subDays(endDateObj, 365);
            break;
        case 'YTD':
            // Year to date: from Jan 1 of current year
            startDateObj = new Date(ref.getFullYear(), 0, 1);
            break;
        default:
            // Default to 1 week
            startDateObj = subDays(endDateObj, 7);
    }

    return {
        start: format(startDateObj, 'yyyy-MM-dd'),
        end: endDate
    };
}
