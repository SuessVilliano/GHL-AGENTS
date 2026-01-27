import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import * as cheerio from 'cheerio';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export interface BrandBrain {
    brand_name: string;
    domain: string;
    industry_niche: string;
    key_services: string[];
    primary_offer: string;
    geographic_location: string;
    tone_profile: {
        professional: number;
        friendly: number;
        direct: number;
    };
    do_say: string[];
    dont_say: string[];
    faqs: { q: string; a: string }[];
    target_keywords: string[];
    aeo_profile: {
        common_questions: string[];
        answer_patterns: string[];
        schema_suggestions: string[];
    };
    social_proof: string[];
}

/**
 * Brand Scanner Service
 * Analyzes websites and social media to build brand identity
 */
export const brandScanner = {
    /**
     * Scan a website and extract brand identity
     */
    async scanWebsite(url: string): Promise<BrandBrain> {
        try {
            // 1. Fetch website HTML
            console.log(`[Brand Scanner] Fetching ${url}...`);
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; LIV8-Bot/1.0)'
                },
                timeout: 10000
            });

            const html = response.data;

            // 2. Extract text content with Cheerio
            const $ = cheerio.load(html);

            // Remove script and style tags
            $('script, style, noscript').remove();

            // Extract key content
            const title = $('title').text();
            const metaDescription = $('meta[name="description"]').attr('content') || '';
            const headings = $('h1, h2, h3').map((_, el) => $(el).text()).get().join('\n');
            const bodyText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 5000);

            // 3. Use Gemini to analyze brand
            if (!GEMINI_API_KEY) {
                throw new Error('GEMINI_API_KEY not configured');
            }

            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({
                model: 'gemini-1.5-flash',
                generationConfig: {
                    responseMimeType: 'application/json'
                }
            });

            const analysisPrompt = `Analyze this website and extract comprehensive brand identity for AI optimization:

Website: ${url}
Title: ${title}
Meta Description: ${metaDescription}

Key Headings:
${headings}

Body Content (sample):
${bodyText}

Extract and return JSON with:
1. brand_name: The company/brand name
2. industry_niche: Specific industry (e.g., "Roofing Contractor", "HVAC Services", "Real Estate")
3. key_services: Array of main services offered
4. primary_offer: The main value proposition
5. geographic_location: Where they operate (city, state, or "Nationwide")
6. tone_profile: Scores 0-1 for professional, friendly, direct
7. do_say: Array of phrases/terms the brand uses
8. dont_say: Array of phrases to avoid based on brand voice
9. faqs: Array of common questions with answers (extract from FAQ section if exists)
10. target_keywords: SEO/AEO keywords (what they rank for)
11. aeo_profile: 
    - common_questions: Questions people ask about this business type
    - answer_patterns: How to structure answers for AI engines
    - schema_suggestions: Recommended schema.org types
12. social_proof: Testimonials, awards, certifications mentioned

Be specific and accurate. If information is unclear, make reasonable inferences based on industry.`;

            const result = await model.generateContent(analysisPrompt);
            const responseText = result.response.text();
            const brandBrain: BrandBrain = JSON.parse(responseText);
            brandBrain.domain = url;

            console.log(`[Brand Scanner] Successfully analyzed ${brandBrain.brand_name}`);

            return brandBrain;

        } catch (error: any) {
            console.error('[Brand Scanner] Error:', error.message);

            // Return fallback brand brain
            return {
                brand_name: 'Your Business',
                domain: url,
                industry_niche: 'Local Services',
                key_services: ['Service 1', 'Service 2'],
                primary_offer: 'Quality service for your needs',
                geographic_location: 'Local Area',
                tone_profile: { professional: 0.7, friendly: 0.6, direct: 0.5 },
                do_say: ['professional', 'reliable', 'experienced'],
                dont_say: ['cheap', 'discount'],
                faqs: [
                    { q: 'What services do you offer?', a: 'We offer comprehensive services.' },
                    { q: 'What areas do you serve?', a: 'We serve the local area.' }
                ],
                target_keywords: ['local services', 'professional'],
                aeo_profile: {
                    common_questions: ['How much does it cost?', 'Are you licensed?'],
                    answer_patterns: ['Direct answers', 'Include pricing context'],
                    schema_suggestions: ['LocalBusiness', 'Service']
                },
                social_proof: []
            };
        }
    },

    /**
     * Calculate AEO score potential based on brand brain
     */
    calculateAEOScore(brandBrain: BrandBrain): { score: number; recommendations: string[] } {
        let score = 0;
        const recommendations: string[] = [];

        // Has comprehensive FAQs
        if (brandBrain.faqs.length >= 5) {
            score += 15;
        } else {
            recommendations.push('Add more FAQs (target 10+) for better AEO coverage');
        }

        // Clear service offerings
        if (brandBrain.key_services.length >= 3) {
            score += 10;
        }

        // Geographic targeting
        if (brandBrain.geographic_location !== 'Local Area') {
            score += 10;
        } else {
            recommendations.push('Specify exact service areas for local SEO');
        }

        // Target keywords defined
        if (brandBrain.target_keywords.length >= 5) {
            score += 15;
        }

        // Social proof
        if (brandBrain.social_proof.length > 0) {
            score += 10;
        } else {
            recommendations.push('Add testimonials, reviews, and certifications');
        }

        // Schema suggestions
        if (brandBrain.aeo_profile.schema_suggestions.length > 0) {
            score += 10;
        }

        // Base score for having analysis
        score += 30;

        return {
            score: Math.min(score, 100),
            recommendations
        };
    }
};
