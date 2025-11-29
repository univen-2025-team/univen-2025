/**
 * Stock Data Schema
 * Cached individual stock data from vnstock
 */

import mongoose, { Schema, Document } from 'mongoose';

interface IStockMetadata {
    fetchedAt: Date;
}

export interface IStockData extends Document {
    symbol: string;
    date: string;
    companyName: string;
    price: number;
    prices: Array<{
        time: string;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
    }>;
    change: number;
    changePercent: number;
    volume: number;
    high: number;
    low: number;
    open: number;
    close: number;
    previousClose: number;
    metadata: IStockMetadata;
}

const StockMetadataSchema = new Schema(
    {
        fetchedAt: { type: Date, default: Date.now }
    },
    { _id: false }
);

const StockDataSchema = new Schema(
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
        companyName: {
            type: String,
            default: ''
        },
        price: {
            type: Number,
            required: true,
            default: 0
        },
        prices: [
            {
                time: String,
                open: Number,
                high: Number,
                low: Number,
                close: Number,
                volume: Number
            }
        ],
        change: {
            type: Number,
            default: 0
        },
        changePercent: {
            type: Number,
            default: 0
        },
        volume: {
            type: Number,
            default: 0
        },
        high: {
            type: Number,
            default: 0
        },
        low: {
            type: Number,
            default: 0
        },
        open: {
            type: Number,
            default: 0
        },
        close: {
            type: Number,
            default: 0
        },
        previousClose: {
            type: Number,
            default: 0
        },
        metadata: {
            type: StockMetadataSchema,
            default: () => ({})
        }
    },
    {
        timestamps: true,
        collection: 'stock_data'
    }
);

// Composite unique index on symbol and date
StockDataSchema.index({ symbol: 1, date: 1 }, { unique: true });
StockDataSchema.index({ date: -1 });
StockDataSchema.index({ symbol: 1 });

export default mongoose.model<IStockData>('StockData', StockDataSchema);
