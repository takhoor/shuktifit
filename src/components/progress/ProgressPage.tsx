import { Header } from '../layout/Header';
import { Card } from '../ui/Card';

export function ProgressPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Progress" />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-8">
        <Card className="text-center py-12">
          <span className="text-4xl mb-4 block">📊</span>
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            Progress & Analytics
          </h2>
          <p className="text-sm text-text-secondary">
            Charts, body measurements, and AI reports will appear here.
          </p>
          <p className="text-xs text-text-muted mt-2">
            Coming in Phase 5
          </p>
        </Card>
      </div>
    </div>
  );
}
