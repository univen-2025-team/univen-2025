/**
 * Stock Ticks Schema
 * Separate collection for tick-level intraday data
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IStockTick extends Document {
    symbol: string;
    date: string;
    time: string;
    price: number;
    volume: number;
}

const StockTickSchema = new Schema(
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
        time: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        volume: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: false,
        collection: 'stock_ticks'
    }
);

// Composite index for efficient queries
StockTickSchema.index({ symbol: 1, date: 1, time: 1 });
StockTickSchema.index({ symbol: 1, date: 1 });

export default mongoose.model<IStockTick>('StockTick', StockTickSchema);
