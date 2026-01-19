/**
 * Learn Product Model
 * Mongoose schema for storing generated lessons from price events
 */

import mongoose, { Schema, Document } from 'mongoose';
import type { DifficultyLevel, AgeGroup } from '@/types/learn-product.types';

export interface ILearnProduct extends Document {
    symbol: string;
    eventDate: Date;
    priceChangePercent: number;
    lessonTitle: string;
    lessonContent: string;
    newsSummary: string | null;
    keyTakeaways: string[];
    difficultyLevel: DifficultyLevel;
    confidenceScore: number;
    userAgeGroup?: AgeGroup;
    createdAt: Date;
    updatedAt: Date;
}

const LearnProductSchema = new Schema<ILearnProduct>(
    {
        symbol: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
            index: true
        },
        eventDate: {
            type: Date,
            required: true,
            index: true
        },
        priceChangePercent: {
            type: Number,
            required: true
        },
        lessonTitle: {
            type: String,
            required: true,
            maxlength: 500
        },
        lessonContent: {
            type: String,
            required: true
        },
        newsSummary: {
            type: String,
            default: null
        },
        keyTakeaways: {
            type: [String],
            default: []
        },
        difficultyLevel: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'intermediate'
        },
        confidenceScore: {
            type: Number,
            min: 0,
            max: 1,
            default: 0.8
        },
        userAgeGroup: {
            type: String,
            enum: ['teen', 'young_adult', 'adult', 'senior'],
            required: false
        }
    },
    {
        timestamps: true,
        collection: 'learn_product'
    }
);

// Unique compound index for idempotency
LearnProductSchema.index({ symbol: 1, eventDate: 1 }, { unique: true });

// Index for queries
LearnProductSchema.index({ symbol: 1, eventDate: -1 });
LearnProductSchema.index({ difficultyLevel: 1 });

const LearnProductModel = mongoose.model<ILearnProduct>('LearnProduct', LearnProductSchema);

export default LearnProductModel;
