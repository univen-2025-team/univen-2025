import mongoose, { Schema, Document } from 'mongoose';

export interface ICompanyProfile extends Document {
    ticker: string;
    exchange?: string;
    industry?: string;
    companyType?: string;
    establishedYear?: string;
    noEmployees?: number;
    foreignPercent?: number;
    website?: string;
    stockRating?: number;
    deltaInWeek?: number;
    deltaInMonth?: number;
    deltaInYear?: number;
    outstandingShare?: number;
    issueShare?: number;
    companyName?: string;
    companyShortName?: string;
    logo?: string;
    // New fields based on data
    charter_capital?: number;
    company_profile?: string; // Description
    history?: string;
    icb_name2?: string;
    icb_name3?: string;
    icb_name4?: string;
    updated_at?: Date;
}

const CompanyProfileSchema: Schema = new Schema(
    {
        ticker: { type: String, required: true, unique: true },
        exchange: { type: String },
        industry: { type: String },
        companyType: { type: String },
        establishedYear: { type: String },
        noEmployees: { type: Number },
        foreignPercent: { type: Number },
        website: { type: String },
        stockRating: { type: Number },
        deltaInWeek: { type: Number },
        deltaInMonth: { type: Number },
        deltaInYear: { type: Number },
        outstandingShare: { type: Number },
        issueShare: { type: Number },
        companyName: { type: String },
        companyShortName: { type: String },
        logo: { type: String },
        // New fields
        charter_capital: { type: Number },
        company_profile: { type: String },
        history: { type: String },
        icb_name2: { type: String },
        icb_name3: { type: String },
        icb_name4: { type: String },
        updated_at: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        collection: 'company_profiles',
    }
);

export default mongoose.model<ICompanyProfile>('CompanyProfile', CompanyProfileSchema);
