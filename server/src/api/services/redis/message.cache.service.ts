import { redisClient } from "@/services/redis.service"; 
import { getConversationMessagesKey } from "@/utils/redis.util";

const MAX_CACHE = 20 as const;

export type ChatRole = "user" | "system";

export interface CachedMessage {
  role: ChatRole;
  content: string;
  createdAt: string;
  metadata?: {
    senderId?: string;
    senderEmail?: string;
    senderName?: string;
  };
}

const getUserMessagesKey = (userId: string) => `chat:messages:user:${userId}`;

/* ------------------ Thêm message ------------------ */
export const addMessageToCache = async (
  userId: string,
  message: CachedMessage
) => {
  const key = getUserMessagesKey(userId);

  await redisClient.lPush(key, JSON.stringify(message));
  await redisClient.lTrim(key, 0, MAX_CACHE - 1);
};

/* ------------------ Lấy history ------------------ */
export const getCachedMessages = async (
  userId: string
): Promise<CachedMessage[]> => {
  const key = getUserMessagesKey(userId);
  const list = await redisClient.lRange(key, 0, MAX_CACHE - 1);

  return list
    .map((x) => {
      try {
        return JSON.parse(x);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .map((m: any) => {
      if (!m.content && m.text) m.content = m.text;
      if (!m.role) m.role = "user";
      if (!m.createdAt) m.createdAt = new Date().toISOString();
      return m as CachedMessage;
    });
};

export const clearMessageCache = async (userId: string) => {
  const key = getUserMessagesKey(userId);
  await redisClient.del(key);
};