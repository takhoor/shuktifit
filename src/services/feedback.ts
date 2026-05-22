import { db } from '../db';
import type { FeedbackItem, FeedbackCategory } from '../types/database';

export interface NewFeedbackInput {
  category: FeedbackCategory;
  title: string;
  description: string;
  screenshotBlob?: Blob;
  route: string;
}

export async function saveFeedback(input: NewFeedbackInput): Promise<number> {
  const item: FeedbackItem = {
    category: input.category,
    title: input.title.trim(),
    description: input.description.trim(),
    screenshotBlob: input.screenshotBlob,
    route: input.route,
    userAgent: navigator.userAgent,
    appVersion: '0.7.0',
    createdAt: new Date().toISOString(),
  };
  const id = await db.feedback.add(item);
  return id as number;
}

export async function listFeedback(): Promise<FeedbackItem[]> {
  const items = await db.feedback.toArray();
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function deleteFeedback(id: number): Promise<void> {
  await db.feedback.delete(id);
}

export async function clearAllFeedback(): Promise<void> {
  await db.feedback.clear();
}

function categoryEmoji(category: FeedbackCategory): string {
  if (category === 'bug') return '[BUG]';
  if (category === 'enhancement') return '[ENHANCEMENT]';
  return '[NOTE]';
}

function buildMarkdown(items: FeedbackItem[]): string {
  const lines: string[] = [];
  lines.push('# ShuktiFit Feedback');
  lines.push('');
  lines.push(`Exported: ${new Date().toISOString()}`);
  lines.push(`Items: ${items.length}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  items.forEach((item, idx) => {
    const num = String(idx + 1).padStart(3, '0');
    lines.push(`## ${num}. ${categoryEmoji(item.category)} ${item.title}`);
    lines.push('');
    lines.push(`- **Date:** ${item.createdAt}`);
    lines.push(`- **Route:** \`${item.route}\``);
    lines.push(`- **Build:** ${item.appVersion}`);
    if (item.screenshotBlob) {
      lines.push(`- **Screenshot:** \`feedback-${num}.png\``);
    }
    lines.push('');
    lines.push(item.description || '_(no description)_');
    lines.push('');
    lines.push('---');
    lines.push('');
  });

  return lines.join('\n');
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Delay revoke so the download can start
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Exports all feedback as a markdown file plus one PNG per screenshot.
 * Browsers will trigger multiple sequential downloads — the user may need
 * to allow this once.
 */
export async function exportAllFeedback(): Promise<{ items: number }> {
  const items = await listFeedback();
  if (items.length === 0) return { items: 0 };

  const markdown = buildMarkdown(items);
  const dateStr = new Date().toISOString().split('T')[0];

  // Markdown summary
  downloadBlob(
    new Blob([markdown], { type: 'text/markdown' }),
    `shuktifit-feedback-${dateStr}.md`,
  );

  // Individual screenshots, numbered to match the markdown
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.screenshotBlob) continue;
    const num = String(i + 1).padStart(3, '0');
    // Small stagger so the browser doesn't drop downloads
    await new Promise((r) => setTimeout(r, 150));
    downloadBlob(item.screenshotBlob, `feedback-${num}.png`);
  }

  return { items: items.length };
}

/**
 * Downloads a single feedback screenshot. Used from the inbox row action.
 */
export function downloadScreenshot(item: FeedbackItem, index: number): void {
  if (!item.screenshotBlob) return;
  const num = String(index + 1).padStart(3, '0');
  downloadBlob(item.screenshotBlob, `feedback-${num}-${item.category}.png`);
}

/**
 * Builds a markdown snippet for a single feedback item, suitable for clipboard.
 */
export function feedbackToMarkdown(item: FeedbackItem): string {
  const lines = [
    `## ${categoryEmoji(item.category)} ${item.title}`,
    '',
    `- **Date:** ${item.createdAt}`,
    `- **Route:** \`${item.route}\``,
    '',
    item.description || '_(no description)_',
  ];
  return lines.join('\n');
}
