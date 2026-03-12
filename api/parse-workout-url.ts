import Anthropic from '@anthropic-ai/sdk';
import type { VercelRequest, VercelResponse } from './_types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function extractTextFromHTML(html: string): string {
  // Remove script, style, nav, footer, header tags and their contents
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '');

  // Convert common block elements to newlines
  text = text.replace(/<\/(p|div|li|tr|h[1-6])>/gi, '\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<li[^>]*>/gi, '- ');

  // Strip remaining HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));

  // Clean up whitespace
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n\s*\n/g, '\n\n');
  text = text.trim();

  // Truncate to ~12k chars to stay within token limits
  if (text.length > 12000) {
    text = text.slice(0, 12000) + '\n[...truncated]';
  }

  return text;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url as string);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return res.status(400).json({ error: 'Only HTTP/HTTPS URLs are supported' });
      }
    } catch {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    // Fetch the page
    const fetchRes = await fetch(parsedUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ShuktiFit/1.0; Workout Parser)',
        'Accept': 'text/html,application/xhtml+xml,text/plain',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });

    if (!fetchRes.ok) {
      return res.status(422).json({ error: `Failed to fetch URL (HTTP ${fetchRes.status})` });
    }

    const contentType = fetchRes.headers.get('content-type') || '';
    if (!contentType.includes('text/') && !contentType.includes('html') && !contentType.includes('json')) {
      return res.status(422).json({ error: 'URL does not appear to be a web page' });
    }

    const html = await fetchRes.text();
    const pageText = extractTextFromHTML(html);

    if (pageText.length < 50) {
      return res.status(422).json({ error: 'Could not extract enough content from this page' });
    }

    // Ask Claude to parse the workout
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      system: `You are a workout parser. Extract a structured workout from the provided web page text.

Rules:
- Identify all exercises, sets, reps, and weights mentioned
- If the page has multiple workouts, pick the most prominent one
- Guess reasonable rest_seconds: 60-90 for isolation, 120-180 for compound lifts
- Use 0 for target_weight if no weight is specified (bodyweight exercises)
- Classify the workout_type as "push", "pull", or "legs" based on the primary muscle groups. If it's mixed/full-body, pick the dominant type
- If an exercise is clearly supersetted with another, include the superset_with field
- If you cannot find a workout on the page, return a JSON object with "error": "reason"

Return ONLY a JSON object (no markdown fences) with this exact schema:
{
  "workout_type": "push" | "pull" | "legs",
  "exercises": [
    {
      "name": "Exercise Name",
      "sets": 3,
      "target_reps": 10,
      "target_weight": 135,
      "rest_seconds": 90,
      "superset_with": "Other Exercise (optional)",
      "notes": "optional coaching note"
    }
  ],
  "reasoning": "Brief explanation of the workout and source",
  "estimated_duration": 45,
  "source_title": "Title of the article/page"
}`,
      messages: [
        {
          role: 'user',
          content: `Parse the workout from this web page:\n\nURL: ${parsedUrl.toString()}\n\n--- PAGE CONTENT ---\n${pageText}\n--- END ---`,
        },
      ],
    });

    const textBlock = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === 'text',
    );
    if (!textBlock) {
      return res.status(500).json({ error: 'No response from AI' });
    }

    // Parse the JSON response
    let parsed;
    try {
      parsed = JSON.parse(textBlock.text);
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        return res.status(500).json({ error: 'Failed to parse workout from page content' });
      }
    }

    if (parsed.error) {
      return res.status(422).json({ error: parsed.error });
    }

    // Return in ChatAPIResponse format so the client can reuse existing flow
    const sourceTitle = parsed.source_title || 'Web Workout';
    const reply = `I found a workout from **${sourceTitle}**: ${parsed.reasoning}`;

    return res.status(200).json({
      reply,
      toolCall: {
        name: 'create_workout',
        input: {
          workout_type: parsed.workout_type,
          exercises: parsed.exercises,
          reasoning: parsed.reasoning,
          estimated_duration: parsed.estimated_duration,
        },
      },
    });
  } catch (err) {
    console.error('Parse workout URL error:', err);
    const message = err instanceof Error ? err.message : 'Failed to parse workout from URL';
    return res.status(500).json({ error: message });
  }
}
