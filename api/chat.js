// api/chat.js
import OpenAI from 'openai';

const SYSTEM_PROMPT = `
You are a helpful shopping assistant for FairPrice-related product price questions.
Rules:
- Answer questions about product costs, prices, promotions, and comparisons.
- If you do not have live product data, clearly say you do not have real-time pricing.
- Do not invent prices.
- Ask for the exact product name if needed.
- Be concise and helpful.
`;

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
    }

    const { messages } = req.body || {};

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages must be an array' });
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.2,
    });

    const reply = completion.choices?.[0]?.message?.content ?? '';

    return res.status(200).json({ reply });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate response',
    });
  }
}
