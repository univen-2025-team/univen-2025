import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
    conversationId: string;
    senderId: string;
    receiverId?: string;
    text: string;
    createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
    {
        conversationId: { type: String, required: true },
        senderId: { type: String, required: true },
        receiverId: { type: String },
        text: { type: String, required: true },
    },
    { timestamps: true }
);

MessageSchema.index({ createdAt: 1 }, { expires: '30d' });

export const MessageModel = mongoose.model<IMessage>("Message", MessageSchema);