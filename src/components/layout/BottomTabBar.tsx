import { NavLink } from 'react-router-dom';

const tabs = [
  { path: '/', label: 'Home', icon: HomeIcon },
  { path: '/workouts', label: 'Workouts', icon: WorkoutsIcon },
  { path: '/progress', label: 'Progress', icon: ProgressIcon },
  { path: '/exercises', label: 'Exercises', icon: ExercisesIcon },
  { path: '/profile', label: 'Profile', icon: ProfileIcon },
] as const;

export function BottomTabBar() {
  return (
    <nav className="safe-bottom flex items-center justify-around bg-bg-card border-t border-border px-2 pt-2 pb-1">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          end={tab.path === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 min-w-[56px] ${
              isActive ? 'text-accent' : 'text-text-muted'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <tab.icon active={isActive} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function WorkoutsIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ProgressIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function ExercisesIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5h11M6.5 17.5h11" />
      <path d="M4 6.5V4.5a1 1 0 011-1h1.5M4 17.5v2a1 1 0 001 1h1.5M20 6.5V4.5a1 1 0 00-1-1h-1.5M20 17.5v2a1 1 0 01-1 1h-1.5" />
      <line x1="12" y1="3.5" x2="12" y2="20.5" />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
