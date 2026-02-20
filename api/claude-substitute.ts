import Anthropic from '@anthropic-ai/sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

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
    const { exerciseName, primaryMuscles, equipment, experienceLevel, reason } = req.body;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 800,
      system: `You are an expert personal trainer. Suggest 3 substitute exercises.

Respond ONLY with valid JSON matching this schema:
{
  "alternatives": [
    {
      "name": "Exercise Name",
      "equipment": "equipment needed",
      "reasoning": "Why this is a good substitute"
    }
  ]
}`,
      messages: [{
        role: 'user',
        content: `Suggest 3 alternatives for "${exerciseName}" (targets: ${primaryMuscles.join(', ')}).
Available equipment: ${equipment.join(', ')}
Experience level: ${experienceLevel}
${reason ? `Reason for substitution: ${reason}` : ''}

Each substitute must target the same primary muscles and use only the available equipment.`,
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    const result = JSON.parse(jsonMatch[0]);
    return res.status(200).json(result);
  } catch (error) {
    console.error('AI substitute error:', error);
    return res.status(500).json({
      error: 'Failed to get substitutes',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
