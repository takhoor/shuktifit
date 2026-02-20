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
    const { todayType, userProfile, recentWorkouts, exerciseHistory, excludedExercises, userNotes } = req.body;

    const systemPrompt = `You are an expert personal trainer and exercise scientist. Generate a workout plan as structured JSON.

RULES:
- Only suggest exercises using this equipment: ${userProfile.equipment.join(', ')}
- NEVER suggest exercises from this exclusion list: ${excludedExercises.join(', ')}
- The user's experience level is: ${userProfile.experienceLevel}
- Apply progressive overload based on recent history when available
- Order exercises: compounds first, isolation last
- Include 1-2 superset pairings where appropriate for efficiency
- Suggest appropriate rest periods (60-90s for isolation, 90-180s for compounds)

IMPORTANT: Respond ONLY with valid JSON matching this exact schema:
{
  "exercises": [
    {
      "name": "Exercise Name",
      "sets": 3,
      "targetReps": 10,
      "targetWeight": 50,
      "restSeconds": 90,
      "supersetWith": "Other Exercise Name or null",
      "notes": "Brief note about weight selection or form cue"
    }
  ],
  "reasoning": "Brief explanation of workout design decisions",
  "estimatedDuration": 55
}`;

    const userMessage = `Generate a ${todayType.toUpperCase()} day workout for:

**Profile:**
- ${userProfile.name}, ${userProfile.age}yo ${userProfile.gender}
- Level: ${userProfile.experienceLevel}
- Goals: ${userProfile.goals.join(', ')}
- Frequency: ${userProfile.trainingFrequency} days/week
${userProfile.injuries ? `- Injuries/Limitations: ${userProfile.injuries}` : ''}

**Recent Workout History (last 14 days):**
${recentWorkouts.length > 0
  ? recentWorkouts.map((w: { date: string; type: string; exercises: Array<{ name: string; bestWeight: number; bestReps: number; totalSets: number }> }) =>
      `${w.date} (${w.type}): ${w.exercises.map((e) => `${e.name}: ${e.totalSets}x${e.bestReps}@${e.bestWeight}lbs`).join(', ')}`
    ).join('\n')
  : 'No recent history — this may be their first workout.'}

**Exercise Performance Trends:**
${exerciseHistory.length > 0
  ? exerciseHistory.map((e: { name: string; bestWeight: number; bestReps: number; oneRepMax: number; lastDate: string }) =>
      `${e.name}: best ${e.bestWeight}lbs x ${e.bestReps} (est 1RM: ${e.oneRepMax}lbs, last: ${e.lastDate})`
    ).join('\n')
  : 'No exercise history yet.'}

${userNotes ? `**User Notes for Today:** ${userNotes}` : ''}

Generate 5-8 exercises appropriate for a ${todayType} day.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    const workout = JSON.parse(jsonMatch[0]);
    return res.status(200).json(workout);
  } catch (error) {
    console.error('AI workout generation error:', error);
    return res.status(500).json({
      error: 'Failed to generate workout',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
