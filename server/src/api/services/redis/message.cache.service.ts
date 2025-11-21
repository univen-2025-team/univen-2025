import { redisClient } from "@/services/redis.service"; 
import { getConversationMessagesKey } from "@/utils/redis.util";

const MAX_CACHE = 20;

export const addMessageToCache = async (conversationId: string, message: any) => {
  const key = getConversationMessagesKey(conversationId);

  // Push vào đầu danh sách
  await redisClient.lPush(key, JSON.stringify(message));

  // Chỉ giữ lại 20 phần tử
  await redisClient.lTrim(key, 0, MAX_CACHE - 1);
};

export const getCachedMessages = async (conversationId: string) => {
  const key = getConversationMessagesKey(conversationId);

  const list = await redisClient.lRange(key, 0, MAX_CACHE - 1);
  return list.map((x) => JSON.parse(x));
};

export const clearMessageCache = async (conversationId: string) => {
  const key = getConversationMessagesKey(conversationId);
  await redisClient.del(key);
};

