/**
 * Market Intraday Data Schema
 * Stores minute-level data for stocks and indices
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IMarketIntraday extends Document {
    symbol: string;
    time: string; // ISO string or HH:mm:ss depending on source
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    updatedAt: Date;
}

const MarketIntradaySchema = new Schema(
    {
        symbol: {
            type: String,
            required: true,
            index: true
        },
        time: {
            type: String, // Keeping as string to match source format, can be converted to Date if needed
            required: true,
            index: true
        },
        open: Number,
        high: Number,
        low: Number,
        close: Number,
        volume: Number,
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true,
        collection: 'market_intraday'
    }
);

// Compound index for unique constraint and fast lookup
MarketIntradaySchema.index({ symbol: 1, time: 1 }, { unique: true });
MarketIntradaySchema.index({ symbol: 1, time: -1 }); // For getting latest data

export default mongoose.model<IMarketIntraday>('MarketIntraday', MarketIntradaySchema);
