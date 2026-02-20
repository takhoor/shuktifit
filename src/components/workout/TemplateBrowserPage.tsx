import { Header } from '../layout/Header';
import { TemplateBrowser } from './TemplateBrowser';

export function TemplateBrowserPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Templates" showBack />
      <div className="flex-1 overflow-hidden">
        <TemplateBrowser />
      </div>
    </div>
  );
}
