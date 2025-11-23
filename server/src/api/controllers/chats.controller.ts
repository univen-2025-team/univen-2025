import { RequestHandler } from "express";
import * as redis from "../services/redis/message.cache.service.js";
import { OkResponse } from "@/response/success.response.js";
import { NotFoundErrorResponse } from "@/response/error.response.js";
import { AI_CHAT_SERVICE_URL } from "@/configs/server.config.js";

// Nếu Node < 18 thì cần:
// import fetch from "node-fetch";

const SYSTEM_PROMPT = "You are a trading assistant...";

export default class ChatController {
  public static getChats: RequestHandler = async (req, res, _) => {
    const { conversationId } = req.body;
    // xử lý sau
  };

  public static postChatSuggestions: RequestHandler = async (req:any, res:any, _) => {
    try {
      const { conversationId, userId, locale = "vi-VN" } = req.body;

      if (!conversationId || !userId) {
        throw new NotFoundErrorResponse({
          message: "Missing required parameters (conversationId, userId)",
        });
      }
      const cachedMessages = await redis.getCachedMessages(userId);
      const latestFive = cachedMessages.slice(0, 5).reverse(); 

      console.log(userId);

      const messagesForAI = [
        { role: "system", content: SYSTEM_PROMPT },
        ...latestFive.map((m) => ({ role: m.role, content: m.content })),
        ];

        const payloadToAI = {
        messages: messagesForAI,
        meta: {
            user_id: userId,
            session_id: userId, 
            locale,
        },
      };

      // if (!AI_CHAT_SERVICE_URL) {
      //   return new OkResponse({
      //     message: "Mock chat suggestions (AI_CHAT_SERVICE_URL not set)",
      //     metadata: {
      //       conversationId,
      //       reply: "Đây là mock reply do bạn chưa cấu hình AI_CHAT_SERVICE_URL.",
      //       ui_effects: [],
      //       suggestion_messages: [
      //         "Mock gợi ý 1",
      //         "Mock gợi ý 2",
      //         "Mock gợi ý 3",
      //       ],
      //       raw_agent_output: null,
      //       debug_payload_sent_to_ai: payloadToAI,
      //     },
      //   }).send(res);
      // }

      const aiRes = await fetch(AI_CHAT_SERVICE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadToAI),
      });

      const rawText = await aiRes.text();

      let aiData: any = {};
      try {
        aiData = JSON.parse(rawText);
      } catch {
        aiData = {};
      }

      if (!aiRes.ok) {
        return res.json({
          statusCode: 502,
          message: "AI service returned non-2xx status",
          raw: rawText,
        });
      }

      const reply: string = aiData.reply ?? "";
      const uiEffects = Array.isArray(aiData.ui_effects) ? aiData.ui_effects : [];
      const suggestionMessages = Array.isArray(aiData.suggestion_messages)
        ? aiData.suggestion_messages
        : [];
      const rawAgentOutput = aiData.raw_agent_output ?? null;

      if (reply) {
        await redis.addMessageToCache(conversationId, {
          role: "system",
          content: reply,
          createdAt: new Date().toISOString(),
        });
      }

      return new OkResponse({
        message: "Get chat suggestions successfully",
        metadata: {
          conversationId,
          reply,
          ui_effects: uiEffects,
          suggestion_messages: suggestionMessages,
          raw_agent_output: rawAgentOutput,
        },
      }).send(res);
    } catch (error) {
      console.error("postChatSuggestions internal error:", error);

      if (error instanceof NotFoundErrorResponse) {
        throw error;
      }

      return res.status(500).json({
        statusCode: 500,
        message:
          (error as any)?.message ||
          "Internal server error in postChatSuggestions",
      });
    }
  };
}
