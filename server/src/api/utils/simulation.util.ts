import { startOfToday, subDays, isWeekend, getDay, set } from 'date-fns';

/**
 * Calculates the Simulation Target Date based on the current date.
 * Rule:
 * - If today is Sat, Sun, Mon: Target is last Friday.
 * - Otherwise (Tue-Fri): Target is yesterday (T-1).
 */
export const getSimulationTargetDate = (): Date => {
    const today = new Date();
    const dayOfWeek = getDay(today); // 0 = Sun, 1 = Mon, ..., 6 = Sat

    if (dayOfWeek === 0) { // Sunday -> Last Friday (-2 days)
        return subDays(today, 2);
    } else if (dayOfWeek === 1) { // Monday -> Last Friday (-3 days)
        return subDays(today, 3);
    } else if (dayOfWeek === 6) { // Saturday -> Last Friday (-1 day)
        return subDays(today, 1);
    } else {
        // Tue, Wed, Thu, Fri -> Yesterday
        return subDays(today, 1);
    }
};

/**
 * Checks if the current time is within Vietnam stock market hours.
 * 09:00 - 11:30 and 13:00 - 14:45.
 */
export const isMarketOpen = (): boolean => {
    // Implement based on Server Time (assumed UTC+7 or handling local time via Env)
    // FORCE Vietnam Time (UTC+7) for accurate check
    const now = new Date();
    const vnTimeStr = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(now);

    // vnTimeStr is "HH:mm"
    const [h, m] = vnTimeStr.split(':').map(Number);
    const time = h * 100 + m;

    // Morning: 09:00 (900) - 11:30 (1130)
    // Afternoon: 13:00 (1300) - 14:45 (1445)

    // Simple check
    return (time >= 900 && time <= 1130) || (time >= 1300 && time <= 1445);
};

/**
 * Combines Simulation Target Date with Current Time (HH:mm)
 * Returns a Date object representing the point in the past we want to query.
 */
export const getSimulatedTimePoint = (): Date => {
    const targetDate = getSimulationTargetDate();
    const now = new Date();

    // Get Vietnam Time
    const vnTimeStr = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(now);

    const [h, m] = vnTimeStr.split(':').map(Number);

    return set(targetDate, {
        hours: h,
        minutes: m,
        seconds: 0,
        milliseconds: 0
    });
};
