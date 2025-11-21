import { MessageModel } from "../../message.model";

export async function createMessage(data: {
    conversationId: string;
    senderId: string;
    receiverId?: string;
    text: string;
}) {
    return await MessageModel.create(data);
}

export async function getMessagesByConversation(
    conversationId: string,
    limit: number = 20,
    before?: Date
) {
    const query: any = { conversationId };

    if (before) {
        query.createdAt = { $lt: before };
    }

    return await MessageModel.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
}

