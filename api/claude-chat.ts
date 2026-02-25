import Anthropic from '@anthropic-ai/sdk';
import type { VercelRequest, VercelResponse } from './_types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const tools: Anthropic.Tool[] = [
  {
    name: 'create_workout',
    description:
      'Generate a complete new workout plan for the user. Use this when the user explicitly asks to create, generate, or make a new workout (e.g. "make me a push workout", "create a leg day"). Do NOT use this if a workout for today already exists and the user wants to change it — use modify_workout instead.',
    input_schema: {
      type: 'object' as const,
      properties: {
        workout_type: {
          type: 'string',
          enum: ['push', 'pull', 'legs'],
          description: 'The PPL type of the workout.',
        },
        exercises: {
          type: 'array',
          description: 'Ordered list of exercises.',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Exercise name.' },
              sets: { type: 'integer', minimum: 1, maximum: 8 },
              target_reps: { type: 'integer', minimum: 1, maximum: 30 },
              target_weight: {
                type: 'number',
                description: 'Suggested weight in lbs. Use 0 for bodyweight.',
              },
              rest_seconds: {
                type: 'integer',
                description: '60-90 for isolation, 120-180 for compounds.',
              },
              superset_with: {
                type: 'string',
                description: 'Name of the exercise this is supersetted with, if any.',
              },
              notes: { type: 'string', description: 'Brief coaching note.' },
            },
            required: ['name', 'sets', 'target_reps', 'target_weight', 'rest_seconds'],
          },
        },
        reasoning: {
          type: 'string',
          description: '1-2 sentence explanation of exercise and load choices. Shown to the user.',
        },
        estimated_duration: {
          type: 'integer',
          description: 'Estimated workout duration in minutes.',
        },
      },
      required: ['workout_type', 'exercises', 'reasoning', 'estimated_duration'],
    },
  },
  {
    name: 'modify_workout',
    description:
      "Add, remove, or update exercises in the user's existing planned or in-progress workout for today. Only use workout_id and workout_exercise_id values that appear verbatim in the TODAY'S WORKOUT section of the fitness data. Never fabricate IDs.",
    input_schema: {
      type: 'object' as const,
      properties: {
        workout_id: {
          type: 'integer',
          description: "The workout's id from the TODAY'S WORKOUT context.",
        },
        operations: {
          type: 'array',
          description: 'List of operations to apply in order. Batch all changes into one call.',
          items: {
            type: 'object',
            properties: {
              op: {
                type: 'string',
                enum: ['remove', 'update', 'add'],
              },
              workout_exercise_id: {
                type: 'integer',
                description: "Required for 'remove' and 'update'. The workoutExercise id from context.",
              },
              exercise_name: {
                type: 'string',
                description: 'Human-readable exercise name for display in the preview card.',
              },
              target_sets: { type: 'integer' },
              target_reps: { type: 'integer' },
              suggested_weight: { type: 'number' },
              rest_seconds: { type: 'integer' },
              target_weight: {
                type: 'number',
                description: "Used for 'add' operations.",
              },
              sets: {
                type: 'integer',
                description: "Used for 'add' operations.",
              },
              notes: { type: 'string' },
            },
            required: ['op', 'exercise_name'],
          },
        },
        summary: {
          type: 'string',
          description: 'Short sentence summarising the changes. Shown to the user.',
        },
      },
      required: ['workout_id', 'operations', 'summary'],
    },
  },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, context, conversationHistory, todayWorkoutContext } = req.body;

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

You have agentic capabilities: you can create workouts and modify today's planned workout using tools.

TOOL USAGE RULES:
- Use create_workout when the user explicitly asks to create/generate/make a new workout. If a workout for today already exists and they want to change it, use modify_workout instead.
- Use modify_workout when the user asks to remove, add, swap, change, or adjust an exercise in today's existing workout. The workout_id and workout_exercise_id values are in the TODAY'S WORKOUT section below.
- NEVER fabricate or guess workout_id or workout_exercise_id values. Only use IDs shown verbatim in the TODAY'S WORKOUT section.
- Always write a brief conversational text reply alongside any tool call explaining what you are doing. The user will see both.
- Do not call tools for informational questions about programming, form, nutrition, etc.
- If the user refers to an exercise ambiguously, match it to the name shown in context. If you cannot match it, ask for clarification rather than guessing.
- You may batch multiple changes into a single modify_workout call.

${context ? `\n--- USER FITNESS DATA ---\n${context}\n--- END DATA ---` : 'No fitness data available yet.'}

${todayWorkoutContext ? `\n--- TODAY'S WORKOUT (use these exact IDs for modifications) ---\n${todayWorkoutContext}\n--- END TODAY'S WORKOUT ---` : ''}`;

    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    if (Array.isArray(conversationHistory)) {
      const recent = conversationHistory.slice(-10);
      for (const msg of recent) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    messages.push({ role: 'user', content: message });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      tools,
      tool_choice: { type: 'auto' },
      system: systemPrompt,
      messages,
    });

    const textBlocks = response.content.filter(
      (block): block is Anthropic.TextBlock => block.type === 'text',
    );
    const toolBlock = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
    );

    const reply = textBlocks.map((b) => b.text).join('') ||
      (toolBlock ? "Here's what I'm proposing:" : '');

    if (toolBlock) {
      return res.status(200).json({
        reply,
        toolCall: {
          name: toolBlock.name,
          input: toolBlock.input,
        },
      });
    }

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Chat API error:', err);
    const message = err instanceof Error ? err.message : 'Failed to get AI response';
    return res.status(500).json({ error: message });
  }
}
