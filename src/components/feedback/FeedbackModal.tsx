import { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { toast } from '../ui/Toast';
import { saveFeedback } from '../../services/feedback';
import type { FeedbackCategory } from '../../types/database';

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORIES: { value: FeedbackCategory; label: string; color: string }[] = [
  { value: 'bug', label: 'Bug', color: '#FF6B6B' },
  { value: 'enhancement', label: 'Enhancement', color: '#4DABF7' },
  { value: 'note', label: 'Note', color: '#51CF66' },
];

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const location = useLocation();
  const [category, setCategory] = useState<FeedbackCategory>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setCategory('bug');
    setTitle('');
    setDescription('');
    setScreenshot(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setScreenshot(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleClearScreenshot = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setScreenshot(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast('Title is required', 'error');
      return;
    }
    setSaving(true);
    try {
      await saveFeedback({
        category,
        title,
        description,
        screenshotBlob: screenshot ?? undefined,
        route: location.pathname + location.search,
      });
      toast('Feedback saved', 'success');
      reset();
      onClose();
    } catch {
      toast('Could not save feedback', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Send Feedback">
      <div className="overflow-y-auto px-4 py-4 space-y-4">
        {/* Category */}
        <div>
          <label className="text-xs font-semibold text-text-muted uppercase mb-2 block">
            Category
          </label>
          <div className="flex gap-2">
            {CATEGORIES.map((c) => {
              const active = category === c.value;
              return (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                    active
                      ? 'bg-bg-elevated text-text-primary'
                      : 'bg-transparent text-text-secondary border-border'
                  }`}
                  style={active ? { borderColor: c.color, color: c.color } : undefined}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Short summary"
          maxLength={120}
        />

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-text-muted uppercase mb-2 block">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What happened? What did you expect? Steps to reproduce…"
            rows={5}
            className="w-full px-3 py-2.5 rounded-xl bg-bg-elevated border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent resize-none"
          />
        </div>

        {/* Screenshot */}
        <div>
          <label className="text-xs font-semibold text-text-muted uppercase mb-2 block">
            Screenshot (optional)
          </label>
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="screenshot preview"
                className="w-full max-h-48 object-contain rounded-xl border border-border bg-bg-elevated"
              />
              <button
                onClick={handleClearScreenshot}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center"
                aria-label="Remove screenshot"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-6 rounded-xl border border-dashed border-border bg-bg-elevated text-text-secondary text-sm active:bg-bg-card"
            >
              Tap to attach a screenshot
              <p className="text-[10px] text-text-muted mt-1">
                Take one with your device, then pick from gallery
              </p>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="ghost" className="flex-1" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSave} disabled={saving || !title.trim()}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
        <p className="text-[10px] text-text-muted text-center">
          Saved locally on your device. Export from Profile → Feedback to share.
        </p>
      </div>
    </Modal>
  );
}
