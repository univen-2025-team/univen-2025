// logger.config.ts
import path from 'path';
import fs from 'fs';
import winston from 'winston';
import 'winston-daily-rotate-file';
import { format } from 'date-fns';

export const getFileTransport = (level: 'debug' | 'info' | 'warn' | 'error') => {
    const now = new Date();
    const year = format(now, 'yyyy');           // 2025
    const isoWeek = format(now, 'II');          // ISO week, vd "46"
    const isoDay = format(now, 'i');            // 1..7 (Mon..Sun)

    const dirname = path.join(
        process.cwd(),
        'logs',
        year,
        `weeks-${isoWeek}`,
        `day-${isoDay}`,
        level
    );
    fs.mkdirSync(dirname, { recursive: true });

    return new winston.transports.DailyRotateFile({
        level,
        dirname,                                   // thư mục đã được tạo sẵn
        filename: 'app-%DATE%.log',                // TÊN FILE rõ ràng
        datePattern: 'YYYY-MM-DD',                 // pattern an toàn
        zippedArchive: true,
        maxFiles: '30d',
        maxSize: '50m',
        format: winston.format.combine(
            winston.format.metadata(),
            winston.format.timestamp(),
            winston.format.printf((info: any) => {
                const id = info?.metadata?.id;
                const idText = id ? `(${id}) ` : '';
                return `${idText}[${info.timestamp}] [${info.level}]: ${info.message}`;
            })
        ),
    });
};
