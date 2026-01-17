import mongoose, { Schema, Document } from 'mongoose';

export interface IStockSymbol extends Document {
    symbol: string;
    type: string;
    exchange: string;
    enOrganName?: string;
    enOrganShortName?: string;
    organShortName?: string;
    organName?: string;
    icbCode2?: string;
    productGrpId?: string;
    updated_at?: Date;
}

const StockSymbolSchema: Schema = new Schema(
    {
        symbol: { type: String, required: true, unique: true },
        type: { type: String, required: true },
        exchange: { type: String, required: true },
        enOrganName: { type: String },
        enOrganShortName: { type: String },
        organShortName: { type: String },
        organName: { type: String },
        icbCode2: { type: String },
        productGrpId: { type: String },
        updated_at: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        collection: 'stock_symbols',
    }
);

export default mongoose.model<IStockSymbol>('StockSymbol', StockSymbolSchema);
