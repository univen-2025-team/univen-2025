import mongoose, { Schema, Document } from 'mongoose';

export interface INewsItem {
    id?: string;
    title: string;
    short_content?: string;
    full_content?: string;
    source_link?: string;
    image_url?: string;
    public_date?: string; // Stored as ISO string or YYYY-MM-DD
    price_change_pct?: number;
    source?: string;
    source_domain?: string;
    images?: string[];
}

export interface IStockNews extends Document {
    symbol: string;
    date: string; // YYYY-MM-DD
    news: INewsItem[];
    has_news: boolean;
    updated_at: Date;
}

const NewsItemSchema = new Schema({
    id: { type: String },
    title: { type: String, required: true },
    short_content: { type: String },
    full_content: { type: String },
    source_link: { type: String },
    image_url: { type: String },
    public_date: { type: String },
    price_change_pct: { type: Number },
    source: { type: String },
    source_domain: { type: String },
    images: { type: [String], default: [] }
}, { _id: false });

const StockNewsSchema = new Schema({
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
    news: {
        type: [NewsItemSchema],
        default: []
    },
    has_news: {
        type: Boolean,
        default: false,
        index: true
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false,
    collection: 'stock_news'
});

// Composite unique index
StockNewsSchema.index({ symbol: 1, date: 1 }, { unique: true });
StockNewsSchema.index({ date: -1 });

export default mongoose.model<IStockNews>('StockNews', StockNewsSchema);
