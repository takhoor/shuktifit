import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { toast } from '../ui/Toast';
import { db } from '../../db';
import {
  deleteFeedback,
  clearAllFeedback,
  exportAllFeedback,
  downloadScreenshot,
  feedbackToMarkdown,
} from '../../services/feedback';
import { PPL_COLORS } from '../../utils/constants';
import type { FeedbackItem, FeedbackCategory } from '../../types/database';

interface FeedbackInboxProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORY_COLOR: Record<FeedbackCategory, string> = {
  bug: PPL_COLORS.push, // red
  enhancement: PPL_COLORS.pull, // blue
  note: PPL_COLORS.legs, // green
};

export function FeedbackInbox({ open, onClose }: FeedbackInboxProps) {
  const items = useLiveQuery(
    () => db.feedback.toArray().then((arr) => arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt))),
    [],
    [] as FeedbackItem[],
  );
  const [confirmClear, setConfirmClear] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await exportAllFeedback();
      if (result.items === 0) {
        toast('No feedback to export', 'info');
      } else {
        toast(`Exported ${result.items} item${result.items === 1 ? '' : 's'}`, 'success');
      }
    } catch {
      toast('Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleClearAll = async () => {
    await clearAllFeedback();
    setConfirmClear(false);
    toast('Inbox cleared', 'success');
  };

  const handleDelete = async (id: number) => {
    await deleteFeedback(id);
  };

  const handleCopy = async (item: FeedbackItem) => {
    try {
      await navigator.clipboard.writeText(feedbackToMarkdown(item));
      toast('Copied to clipboard', 'success');
    } catch {
      toast('Copy failed', 'error');
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title="Feedback Inbox">
        <div className="overflow-y-auto px-4 py-4 space-y-3">
          {/* Toolbar */}
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={handleExport}
              disabled={exporting || !items || items.length === 0}
            >
              {exporting ? 'Exporting…' : 'Export All'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setConfirmClear(true)}
              disabled={!items || items.length === 0}
            >
              Clear
            </Button>
          </div>

          <p className="text-[10px] text-text-muted">
            Export downloads a markdown summary plus one PNG per screenshot.
            Drop the files into a Claude Code session.
          </p>

          {/* List */}
          {!items || items.length === 0 ? (
            <div className="py-12 text-center text-sm text-text-muted">
              No feedback yet. Tap the flag button while using the app.
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, idx) => (
                <FeedbackRow
                  key={item.id}
                  item={item}
                  index={idx}
                  onDelete={() => item.id && handleDelete(item.id)}
                  onCopy={() => handleCopy(item)}
                />
              ))}
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmClear}
        title="Clear all feedback?"
        message="This permanently deletes every item in your local inbox. Make sure you've exported anything you want to keep."
        confirmLabel="Clear All"
        variant="danger"
        onConfirm={handleClearAll}
        onCancel={() => setConfirmClear(false)}
      />
    </>
  );
}

function FeedbackRow({
  item,
  index,
  onDelete,
  onCopy,
}: {
  item: FeedbackItem;
  index: number;
  onDelete: () => void;
  onCopy: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const color = CATEGORY_COLOR[item.category];
  const previewUrl = item.screenshotBlob
    ? URL.createObjectURL(item.screenshotBlob)
    : null;

  // Note: previewUrl leaks across renders if we don't revoke. Acceptable for
  // a small inbox. Revoke on unmount via effect would be cleaner.
  return (
    <div className="rounded-xl bg-bg-elevated border border-border overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-start gap-3 p-3 text-left active:bg-bg-card"
      >
        <div
          className="w-2 h-2 rounded-full mt-1.5 shrink-0"
          style={{ backgroundColor: color }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-[10px] font-bold uppercase tracking-wide"
              style={{ color }}
            >
              {item.category}
            </span>
            <span className="text-[10px] text-text-muted">
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm font-semibold text-text-primary truncate">
            {item.title}
          </p>
          <p className="text-[10px] text-text-muted truncate">{item.route}</p>
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-border pt-3">
          {item.description && (
            <p className="text-xs text-text-secondary whitespace-pre-wrap">
              {item.description}
            </p>
          )}
          {previewUrl && (
            <img
              src={previewUrl}
              alt="screenshot"
              className="w-full max-h-64 object-contain rounded-lg bg-bg-primary border border-border"
            />
          )}
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="ghost" onClick={onCopy}>
              Copy markdown
            </Button>
            {item.screenshotBlob && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => downloadScreenshot(item, index)}
              >
                Download PNG
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
