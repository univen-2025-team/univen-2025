/**
 * Stock History Schema
 * Matches vnstock-api stock_history collection format.
 * One document per symbol + date + interval containing array of price bars.
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IPriceBar {
    time: string;       // HH:MM:SS format
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface IStockHistory extends Document {
    symbol: string;
    date: string;           // YYYY-MM-DD format
    interval: string;       // 1m, 5m, 15m, 30m, 1H
    unit: string;           // VND or INDEX
    prices: IPriceBar[];    // Array of price bars for the day
    updated_at: Date;
}

const PriceBarSchema = new Schema(
    {
        time: { type: String, required: true },
        open: { type: Number, required: true },
        high: { type: Number, required: true },
        low: { type: Number, required: true },
        close: { type: Number, required: true },
        volume: { type: Number, required: true }
    },
    { _id: false }
);

const StockHistorySchema = new Schema(
    {
        symbol: {
            type: String,
            required: true,
            uppercase: true,
            index: true
        },
        date: {
            type: String,
            required: true,
            index: true
        },
        interval: {
            type: String,
            required: true,
            default: '1m'
        },
        unit: {
            type: String,
            required: true,
            default: 'VND', // VND or INDEX
            enum: ['VND', 'INDEX']
        },
        prices: {
            type: [PriceBarSchema],
            default: []
        },
        updated_at: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: false,
        collection: 'stock_history'  // Same collection as vnstock-api
    }
);

// Composite unique index on symbol + date + interval
StockHistorySchema.index({ symbol: 1, date: 1, interval: 1 }, { unique: true });
StockHistorySchema.index({ date: -1 });

export default mongoose.model<IStockHistory>('StockHistory', StockHistorySchema);
