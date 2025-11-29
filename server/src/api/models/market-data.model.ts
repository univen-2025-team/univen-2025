/**
 * Market Data Schema
 * Cached daily market overview data from vnstock
 */

import mongoose, { Schema, Document } from 'mongoose';

interface IVN30Index {
    index: number;
    change: number;
    changePercent: number;
}

interface IMetadata {
    source: string;
    fetchedAt: Date;
}

export interface IMarketData extends Document {
    date: string;
    timestamp: Date;
    vn30Index: IVN30Index;
    topGainers: any[];
    topLosers: any[];
    totalStocks: number;
    metadata: IMetadata;
}

const VN30IndexSchema = new Schema(
    {
        index: { type: Number, required: true },
        change: { type: Number, required: true },
        changePercent: { type: Number, required: true }
    },
    { _id: false }
);

const MetadataSchema = new Schema(
    {
        source: { type: String, default: 'vnstock3-TCBS' },
        fetchedAt: { type: Date, default: Date.now }
    },
    { _id: false }
);

const MarketDataSchema = new Schema(
    {
        date: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        timestamp: {
            type: Date,
            default: Date.now,
            index: true
        },
        vn30Index: {
            type: VN30IndexSchema,
            required: true
        },
        topGainers: {
            type: [Schema.Types.Mixed],
            default: []
        },
        topLosers: {
            type: [Schema.Types.Mixed],
            default: []
        },
        totalStocks: {
            type: Number,
            default: 0
        },
        metadata: {
            type: MetadataSchema,
            default: () => ({})
        }
    },
    {
        timestamps: true,
        collection: 'market_data'
    }
);

// Indexes
MarketDataSchema.index({ date: 1 }, { unique: true });
MarketDataSchema.index({ timestamp: -1 });

export default mongoose.model<IMarketData>('MarketData', MarketDataSchema);
