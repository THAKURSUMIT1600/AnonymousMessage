import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error('GEMINI_API_KEY is missing in environment variables.');

const genAI = new GoogleGenerativeAI(apiKey);

export async function POST() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    const response = result.response;

    // Extracting text from response
    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return NextResponse.json({ success: true, questions: text.split('||') });
  } catch (error: any) {
    console.error('Error generating questions:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
