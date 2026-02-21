/**
 * News Summary Service
 * Fetches content from URL and summarizes using Groq AI
 */

import LoggerService from './logger.service';
import GroqService from './groq.service';
import { getEnv } from '../utils/env.util';
import { EnvKeyEnum } from '../enums/env.enum';

class NewsSummaryService {
    private static instance: NewsSummaryService;
    private logger: any;

    private constructor() {
        this.logger = LoggerService.getInstance();
    }

    public static getInstance(): NewsSummaryService {
        if (!NewsSummaryService.instance) {
            NewsSummaryService.instance = new NewsSummaryService();
        }
        return NewsSummaryService.instance;
    }

    /**
     * Fetch content from URL and extract text
     * @param url The URL to fetch content from
     * @returns Extracted text content
     */
    private async fetchContentFromUrl(url: string): Promise<string> {
        try {
            this.logger.info(`[NewsSummary] Fetching content from: ${url}`);

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                },
                signal: AbortSignal.timeout(30000) // 30 seconds timeout
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();
            this.logger.info(`[NewsSummary] Fetched HTML (${html.length} chars)`);
            
            // Remove script, style, and other non-content tags
            let cleaned = html
                .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
                .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
                .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '')
                .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
                .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
                .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
                .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '');

            // Try multiple extraction strategies
            let content = '';

            // Strategy 1: Common article selectors (Vietnamese news sites)
            const articlePatterns = [
                /<article[^>]*>([\s\S]*?)<\/article>/i,
                /<div[^>]*class="[^"]*article[^"]*body[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
                /<div[^>]*class="[^"]*content[^"]*body[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
                /<div[^>]*class="[^"]*post[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
                /<div[^>]*class="[^"]*news[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
                /<div[^>]*id="[^"]*article[^"]*body[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
                /<div[^>]*id="[^"]*content[^"]*body[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
                /<div[^>]*class="[^"]*detail[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
                // Cafef specific
                /<div[^>]*class="[^"]*detail[^"]*body[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
                /<div[^>]*class="[^"]*post[^"]*detail[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
                // VnExpress specific
                /<div[^>]*class="[^"]*Normal[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
                // General content divs
                /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
                /<div[^>]*id="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
                /<main[^>]*>([\s\S]*?)<\/main>/i,
            ];

            for (const pattern of articlePatterns) {
                const match = cleaned.match(pattern);
                if (match && match[1]) {
                    const extracted = match[1];
                    // Check if extracted content is meaningful (has enough text)
                    const textOnly = extracted.replace(/<[^>]+>/g, ' ').trim();
                    if (textOnly.length > 200) {
                        content = extracted;
                        this.logger.info(`[NewsSummary] Found content using pattern: ${pattern}`);
                        break;
                    }
                }
            }

            // Strategy 2: If no article found, try to extract all paragraph tags
            if (!content || content.length < 200) {
                const paragraphs = cleaned.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
                if (paragraphs && paragraphs.length > 3) {
                    content = paragraphs.join(' ');
                    this.logger.info(`[NewsSummary] Using paragraph extraction (${paragraphs.length} paragraphs)`);
                }
            }

            // Strategy 3: Fallback to body content
            if (!content || content.length < 200) {
                const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
                if (bodyMatch && bodyMatch[1]) {
                    content = bodyMatch[1];
                    this.logger.info(`[NewsSummary] Using body content as fallback`);
                }
            }

            // If still no content, use entire cleaned HTML
            if (!content || content.length < 200) {
                content = cleaned;
                this.logger.warn(`[NewsSummary] Using entire HTML as last resort`);
            }

            // Remove HTML tags
            let textContent = content.replace(/<[^>]+>/g, ' ');
            
            // Decode HTML entities (more comprehensive)
            const entityMap: { [key: string]: string } = {
                '&nbsp;': ' ',
                '&amp;': '&',
                '&lt;': '<',
                '&gt;': '>',
                '&quot;': '"',
                '&#39;': "'",
                '&apos;': "'",
                '&copy;': '©',
                '&reg;': '®',
                '&trade;': '™',
                '&hellip;': '...',
                '&mdash;': '—',
                '&ndash;': '–',
            };

            for (const [entity, char] of Object.entries(entityMap)) {
                textContent = textContent.replace(new RegExp(entity, 'gi'), char);
            }

            // Decode numeric entities
            textContent = textContent.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
            textContent = textContent.replace(/&#x([a-f\d]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)));

            // Clean up whitespace
            textContent = textContent
                .replace(/\s+/g, ' ')
                .replace(/\n\s*\n/g, '\n')
                .trim();

            // Remove common noise patterns
            textContent = textContent
                .replace(/Đăng ký nhận tin/g, '')
                .replace(/Theo dõi.*?trên/g, '')
                .replace(/Xem thêm.*?tại/g, '')
                .replace(/Nguồn:.*?$/g, '')
                .replace(/Tags?:.*?$/g, '')
                .trim();

            // Limit content length to avoid token limits
            const maxLength = 15000; // Increased for better context
            if (textContent.length > maxLength) {
                textContent = textContent.substring(0, maxLength) + '...';
            }

            if (!textContent || textContent.length < 100) {
                this.logger.error(`[NewsSummary] Extracted content too short: ${textContent.length} chars`);
                this.logger.debug(`[NewsSummary] First 500 chars: ${textContent.substring(0, 500)}`);
                throw new Error(`Content too short (${textContent.length} chars) or could not extract meaningful content`);
            }

            this.logger.info(`[NewsSummary] Successfully extracted ${textContent.length} characters from URL`);
            return textContent;

        } catch (error: any) {
            this.logger.error(`[NewsSummary] Error fetching content from ${url}:`, error);
            throw new Error(`Failed to fetch content: ${error.message}`);
        }
    }

    /**
     * Summarize content using Groq AI. Returns markdown with data highlights as blockquotes.
     * @param content The content to summarize
     * @param title Optional title of the article
     * @returns Summary as markdown (use > for quote highlights)
     */
    private async summarizeWithGroq(content: string, title?: string): Promise<string> {
        try {
            if (!GroqService.isAvailable()) {
                throw new Error('Groq API key is not configured');
            }

            const prompt = `Bạn là chuyên gia phân tích tin tức tài chính. TÓM TẮT bài viết, **CHÚ TRỌNG PHÂN TÍCH SỐ LIỆU**: %, giá, khối lượng, mã CP, doanh thu, lợi nhuận, biến động...

${title ? `Tiêu đề: ${title}\n\n` : ''}Nội dung:
${content}

Yêu cầu:
1. Trả về **đúng Markdown**, tiếng Việt.
2. **Phân tích số liệu** là ưu tiên: trích dẫn đầy đủ %, số, mã CP, so sánh trước/sau.
3. Dùng **blockquote** để highlight các con số / quote quan trọng. Ví dụ:
   > Vốn hóa tăng **12,5%** lên 450.000 tỷ; **VNM** +3,2%, **VHM** -1,1%.
4. Đoạn thường: paragraph bình thường. Đoạn có số liệu nổi bật: dùng \`> ...\`.
5. Tóm tắt 4–7 câu, súc tích. Chỉ trả nội dung markdown, không giải thích thêm.`;

            const apiKey = getEnv({ key: EnvKeyEnum.GROQ_API_KEY, isRequired: true });

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        {
                            role: 'system',
                            content: 'Bạn là chuyên gia phân tích tin tức tài chính. Trả lời bằng tiếng Việt. Luôn trả về Markdown: dùng **bold** cho số liệu, dùng blockquote (>) để highlight các quote/số liệu quan trọng. Ưu tiên phân tích số liệu (%, giá, mã CP, doanh thu...).'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 900,
                    temperature: 0.25
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

            const summary = data.choices[0].message.content.trim();
            this.logger.info(`[NewsSummary] Generated summary (${summary.length} chars)`);
            
            return summary;

        } catch (error: any) {
            this.logger.error(`[NewsSummary] Error summarizing content:`, error);
            throw error;
        }
    }

    /**
     * Fetch and summarize news article from URL or use provided content
     * @param url The URL of the news article
     * @param title Optional title of the article
     * @param content Optional pre-fetched content (if available from news API)
     * @returns Summary of the article
     */
    public async summarizeNews(url: string, title?: string, content?: string): Promise<string> {
        try {
            let articleContent: string;

            // If content is provided, use it directly
            if (content && content.trim().length > 100) {
                this.logger.info(`[NewsSummary] Using provided content (${content.length} chars)`);
                articleContent = content;
            } else {
                // Otherwise, fetch from URL
                if (!url || !url.startsWith('http')) {
                    throw new Error('Invalid URL provided');
                }
                this.logger.info(`[NewsSummary] Fetching content from URL: ${url}`);
                articleContent = await this.fetchContentFromUrl(url);
            }

            // Summarize using Groq
            const summary = await this.summarizeWithGroq(articleContent, title);

            return summary;

        } catch (error: any) {
            this.logger.error(`[NewsSummary] Error summarizing news from ${url}:`, error);
            throw error;
        }
    }
}

export default NewsSummaryService;
