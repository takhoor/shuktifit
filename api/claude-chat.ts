import Anthropic from '@anthropic-ai/sdk';
import type { VercelRequest, VercelResponse } from './_types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, context, conversationHistory } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = `You are a knowledgeable, supportive fitness coach embedded in the ShuktiFit workout app. You have access to the user's fitness data summarized below.

Your role:
- Provide actionable fitness advice, form cues, and programming insights
- Identify plateaus and suggest ways to break through them
- Notice patterns in the data (e.g., volume trends, frequency gaps, body composition changes)
- Be encouraging but honest — point out areas for improvement tactfully
- Keep responses concise and conversational (2-4 paragraphs max)
- Use specific numbers from the data when relevant
- If asked about something outside your data, say so rather than guessing

${context ? `\n--- USER FITNESS DATA ---\n${context}\n--- END DATA ---` : 'No fitness data available yet.'}`;

    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    // Include conversation history (last 10 messages for context window management)
    if (Array.isArray(conversationHistory)) {
      const recent = conversationHistory.slice(-10);
      for (const msg of recent) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    // Add the new user message
    messages.push({ role: 'user', content: message });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const reply = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Chat API error:', err);
    const message = err instanceof Error ? err.message : 'Failed to get AI response';
    return res.status(500).json({ error: message });
  }
}
