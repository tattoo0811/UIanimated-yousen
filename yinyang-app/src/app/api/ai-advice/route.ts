
import { NextRequest, NextResponse } from 'next/server';
import { calculateBaZi, calculateYangSen, calculateFiveElements } from '@/utils/logic';
import { getDailyFortune } from '@/utils/dailyLogic';
import { calculateDetailedScores } from '@/utils/scoringLogic';
import { SANMEI_KNOWLEDGE, SYSTEM_PROMPT_TEMPLATE, COACHING_SYSTEM_PROMPT, USER_PROMPT_TEMPLATES } from '@/data/sanmeiKnowledge';

export async function POST(req: NextRequest) {
    try {
        const { birthDate, birthTime, targetDate, type = 'daily', userQuestion, partnerBirthDate, partnerBirthTime, partners } = await req.json();

        if (!birthDate) {
            return NextResponse.json({ error: 'Birth date is required' }, { status: 400 });
        }

        // Parse dates
        const bDate = new Date(birthDate);
        if (birthTime) {
            const [h, m] = birthTime.split(':').map(Number);
            bDate.setHours(h, m);
        }
        const tDate = targetDate ? new Date(targetDate) : new Date();

        // 1. Calculate User's Chart
        const bazi = calculateBaZi(bDate);
        const yangSen = calculateYangSen(bazi);
        const fiveElements = calculateFiveElements(bazi); // Need this for detailed scores

        // Calculate Detailed Scores (100 items)
        const detailed = calculateDetailedScores(bazi, fiveElements, yangSen, 'unknown', bDate);
        const jsonStr = JSON.stringify(detailed, null, 2);

        // 2. Calculate Daily Fortune (Keep for legacy/daily specific context if needed)
        const dailyFortune = getDailyFortune(bazi, tDate);

        // 3. Construct Prompt based on Type
        let systemPrompt = COACHING_SYSTEM_PROMPT;
        let userPrompt = '';

        if (type === 'daily') {
            // Use new Daily Action Template
            userPrompt = USER_PROMPT_TEMPLATES.daily.replace('{{JSON_DATA}}', jsonStr);
        } else if (type === 'report') {
            userPrompt = USER_PROMPT_TEMPLATES.report.replace('{{JSON_DATA}}', jsonStr);
        } else if (type === 'love') {
            userPrompt = USER_PROMPT_TEMPLATES.love.replace('{{JSON_DATA}}', jsonStr);
        } else if (type === 'career') {
            userPrompt = USER_PROMPT_TEMPLATES.career.replace('{{JSON_DATA}}', jsonStr);
        } else if (type === 'coaching') {
            userPrompt = USER_PROMPT_TEMPLATES.coaching
                .replace('{{JSON_DATA}}', jsonStr)
                .replace('{{USER_QUESTION}}', userQuestion || '今の運勢について教えてください');
        } else if (type === 'compatibility') {
            // For compatibility, we need partner's chart
            if (partnerBirthDate) {
                const pDate = new Date(partnerBirthDate);
                if (partnerBirthTime) {
                    const [h, m] = partnerBirthTime.split(':').map(Number);
                    pDate.setHours(h, m);
                }
                const pBazi = calculateBaZi(pDate);
                const pYangSen = calculateYangSen(pBazi);
                const pFiveElements = calculateFiveElements(pBazi);
                const pDetailed = calculateDetailedScores(pBazi, pFiveElements, pYangSen, 'unknown', pDate);

                userPrompt = USER_PROMPT_TEMPLATES.compatibility
                    .replace('{{JSON_A}}', jsonStr)
                    .replace('{{JSON_B}}', JSON.stringify(pDetailed, null, 2));
            } else {
                return NextResponse.json({ error: 'Partner birth date required for compatibility' }, { status: 400 });
            }
        } else if (type === 'group_compatibility') {
            if (!partners || !Array.isArray(partners) || partners.length === 0) {
                return NextResponse.json({ error: 'Partners list required for group compatibility' }, { status: 400 });
            }

            // Include user as the first member
            const members = [
                { name: '自分', birthDate, birthTime, isUser: true },
                ...partners
            ];

            const membersData = await Promise.all(members.map(async (m) => {
                const date = new Date(m.birthDate);
                if (m.birthTime) {
                    const [h, min] = m.birthTime.split(':').map(Number);
                    date.setHours(h, min);
                }
                const mbazi = calculateBaZi(date);
                const mYangSen = calculateYangSen(mbazi);
                const mFiveElements = calculateFiveElements(mbazi);
                const mDetailed = calculateDetailedScores(mbazi, mFiveElements, mYangSen, 'unknown', date);

                return {
                    name: m.name || 'Unknown',
                    data: mDetailed
                };
            }));

            const jsonListStr = JSON.stringify(membersData, null, 2);
            userPrompt = USER_PROMPT_TEMPLATES.group_compatibility.replace('{{JSON_LIST}}', jsonListStr);

            // Force JSON response for group compatibility
            systemPrompt += "\n必ずJSON形式のみを出力してください。";

        } else {
            // Fallback to original simple daily logic if type is unknown or specific legacy request
            // ... (Original logic could go here, but let's default to Report or Daily)
            userPrompt = USER_PROMPT_TEMPLATES.report.replace('{{JSON_DATA}}', jsonStr);
        }

        // 4. Call OpenRouter API
        const apiKey = process.env.OPENROUTER_API_KEY;
        console.log('API Key check:', apiKey ? `Present (starts with ${apiKey.substring(0, 4)}...)` : 'Missing');

        if (!apiKey) {
            console.error('OPENROUTER_API_KEY is missing');
            return NextResponse.json({ error: 'Server configuration error: API Key missing' }, { status: 500 });
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'http://localhost:3000', // Update for local dev
                'X-Title': 'YinYang App',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-3.3-70b-instruct:free', // User requested model
                response_format: { type: 'json_object' },
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
                max_tokens: 2000 // Increased for detailed reports
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenRouter API Error:', errorData);
            return NextResponse.json({ error: 'Failed to fetch AI response' }, { status: 500 });
        }

        const data = await response.json();
        const aiMessage = data.choices[0].message.content;

        return NextResponse.json({
            advice: aiMessage,
            dailyFortune // Return calculated data too for UI display
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
