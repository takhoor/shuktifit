import { Outlet } from 'react-router-dom';
import { BottomTabBar } from './BottomTabBar';
import { ChatFAB } from '../chat/ChatFAB';

export function AppShell() {
  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <Outlet />
      </main>
      <BottomTabBar />
      <ChatFAB />
    </div>
  );
}
