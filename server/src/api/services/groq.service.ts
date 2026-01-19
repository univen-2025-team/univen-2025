/**
 * Groq LLM Service
 * Wrapper for Groq API for lesson generation
 */

import LoggerService from './logger.service';
import type {
    AbnormalPriceEvent,
    GeneratedLesson,
    LessonGenerationRequest,
    DifficultyLevel,
    AgeGroup
} from '@/types/learn-product.types';
import { classifyAgeGroup, getAgeGroupLabel } from '@/types/learn-product.types';

const CONFIG = {
    MODEL: 'llama-3.3-70b-versatile', // hoặc 'mixtral-8x7b-32768'
    MAX_TOKENS: 2048,
    TEMPERATURE: 0.7,
    API_URL: 'https://api.groq.com/openai/v1/chat/completions'
};

export default class GroqService {
    private static logger = LoggerService.getInstance();

    /**
     * Check if Groq service is configured
     */
    static isAvailable(): boolean {
        return !!process.env.GROQ_API_KEY;
    }

    /**
     * Build prompt for lesson generation
     */
    private static buildPrompt(request: LessonGenerationRequest): string {
        const { event, userAge } = request;
        const ageGroup = classifyAgeGroup(userAge);
        const direction = event.priceChangePercent > 0 ? 'TĂNG' : 'GIẢM';
        const absChange = Math.abs(event.priceChangePercent).toFixed(2);

        const newsContext = event.relatedNews.length > 0
            ? event.relatedNews.map(n => `- ${n.title}`).join('\n')
            : 'Không có tin tức cụ thể trong khoảng thời gian này';

        return `Bạn là một chuyên gia giáo dục tài chính. Tạo một bài học dựa trên sự kiện giá cổ phiếu bất thường.

## SỰ KIỆN
- Mã cổ phiếu: ${event.symbol}
- Ngày xảy ra: ${event.eventDate}
- Biến động: ${direction} ${absChange}%
- Giá mở cửa: ${event.priceData.open.toLocaleString('vi-VN')} VND
- Giá cao nhất: ${event.priceData.high.toLocaleString('vi-VN')} VND
- Giá thấp nhất: ${event.priceData.low.toLocaleString('vi-VN')} VND
- Giá đóng cửa: ${event.priceData.close.toLocaleString('vi-VN')} VND
- Khối lượng giao dịch: ${event.priceData.volume.toLocaleString('vi-VN')}

## TIN TỨC LIÊN QUAN (±2 ngày)
${newsContext}

## ĐỐI TƯỢNG HỌC
- Tuổi: ${userAge}
- Nhóm: ${getAgeGroupLabel(ageGroup)}

## YÊU CẦU BÀI HỌC
1. Giải thích nguyên nhân có thể dẫn đến biến động giá
2. Phân tích các yếu tố ảnh hưởng
3. Rút ra bài học kinh nghiệm cho nhà đầu tư
4. Điều chỉnh ngôn ngữ phù hợp với độ tuổi người học

QUAN TRỌNG: KHÔNG đưa ra lời khuyên đầu tư cụ thể.

## OUTPUT FORMAT
Trả về JSON thuần (không markdown, không code block):
{
  "lessonTitle": "Tiêu đề ngắn gọn, hấp dẫn",
  "lessonContent": "Nội dung bài học chi tiết, dễ hiểu",
  "newsSummary": "Tóm tắt tin tức liên quan hoặc null",
  "keyTakeaways": ["Điểm 1", "Điểm 2", "Điểm 3"],
  "difficultyLevel": "beginner hoặc intermediate hoặc advanced",
  "confidenceScore": 0.0 đến 1.0
}`;
    }

    /**
     * Parse and validate Groq response
     */
    private static parseResponse(content: string): GeneratedLesson {
        // Strip markdown code blocks if present
        let cleaned = content.trim();
        
        if (cleaned.startsWith('```json')) {
            cleaned = cleaned.slice(7);
        } else if (cleaned.startsWith('```')) {
            cleaned = cleaned.slice(3);
        }
        if (cleaned.endsWith('```')) {
            cleaned = cleaned.slice(0, -3);
        }
        cleaned = cleaned.trim();

        try {
            const parsed = JSON.parse(cleaned);

            // Validate required fields
            if (!parsed.lessonTitle || typeof parsed.lessonTitle !== 'string') {
                throw new Error('Missing or invalid lessonTitle');
            }
            if (!parsed.lessonContent || typeof parsed.lessonContent !== 'string') {
                throw new Error('Missing or invalid lessonContent');
            }

            // Normalize and return
            return {
                lessonTitle: String(parsed.lessonTitle).slice(0, 500),
                lessonContent: String(parsed.lessonContent),
                newsSummary: parsed.newsSummary ? String(parsed.newsSummary) : null,
                keyTakeaways: Array.isArray(parsed.keyTakeaways)
                    ? parsed.keyTakeaways.map(String).slice(0, 10)
                    : [],
                difficultyLevel: this.validateDifficulty(parsed.difficultyLevel),
                confidenceScore: this.validateConfidence(parsed.confidenceScore)
            };
        } catch (error) {
            this.logger.error('Failed to parse Groq response', error as Error);
            this.logger.debug('Raw response:', content.slice(0, 500));
            throw new Error('Invalid JSON response from Groq');
        }
    }

    /**
     * Validate difficulty level
     */
    private static validateDifficulty(value: any): DifficultyLevel {
        const valid: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced'];
        return valid.includes(value) ? value : 'intermediate';
    }

    /**
     * Validate confidence score
     */
    private static validateConfidence(value: any): number {
        const num = Number(value);
        if (isNaN(num)) return 0.8;
        return Math.max(0, Math.min(1, num));
    }

    /**
     * Call Groq API
     */
    private static async callGroqAPI(prompt: string): Promise<string> {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error('GROQ_API_KEY environment variable is not set');
        }

        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: CONFIG.MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'Bạn là một chuyên gia giáo dục tài chính Việt Nam. Trả lời bằng tiếng Việt và format JSON.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: CONFIG.MAX_TOKENS,
                temperature: CONFIG.TEMPERATURE
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            this.logger.error(`Groq API error: ${response.status} - ${errorBody}`);
            throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid response structure from Groq API');
        }

        return data.choices[0].message.content;
    }

    /**
     * Generate a lesson from an abnormal price event
     */
    static async generateLesson(request: LessonGenerationRequest): Promise<GeneratedLesson> {
        const { event } = request;

        this.logger.info(
            `Generating lesson for ${event.symbol} on ${event.eventDate} ` +
            `(${event.priceChangePercent > 0 ? '+' : ''}${event.priceChangePercent.toFixed(2)}%)`
        );

        try {
            const prompt = this.buildPrompt(request);
            const text = await this.callGroqAPI(prompt);

            if (!text) {
                throw new Error('No text content in Groq response');
            }

            const lesson = this.parseResponse(text);

            this.logger.info(`Generated lesson: "${lesson.lessonTitle}"`);

            return lesson;
        } catch (error) {
            this.logger.error(`Groq API error for ${event.symbol}`, error as Error);
            throw error;
        }
    }

    /**
     * Generate lessons in batch with rate limiting
     */
    static async generateLessonsBatch(
        requests: LessonGenerationRequest[],
        delayMs: number = 500 // Groq có rate limit cao hơn Gemini
    ): Promise<Map<string, GeneratedLesson>> {
        const results = new Map<string, GeneratedLesson>();

        for (const request of requests) {
            const key = `${request.event.symbol}_${request.event.eventDate}`;

            try {
                const lesson = await this.generateLesson(request);
                results.set(key, lesson);

                // Rate limiting delay
                if (delayMs > 0) {
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                }
            } catch (error) {
                this.logger.error(`Failed to generate lesson for ${key}`, error as Error);
                // Continue with next request
            }
        }

        return results;
    }
}
