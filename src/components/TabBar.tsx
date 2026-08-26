import { NavLink } from 'react-router-dom';
import { Home, NotebookPen, BookOpen, Users, User } from 'lucide-react';

const TABS = [
  { to: '/', label: '首页', icon: Home },
  { to: '/record', label: '记录', icon: NotebookPen },
  { to: '/knowledge', label: '知识', icon: BookOpen },
  { to: '/family', label: '家庭', icon: Users },
  { to: '/profile', label: '我的', icon: User },
];

export function TabBar() {
  return (
    <nav className="sticky bottom-0 z-30 border-t border-[var(--color-line)] bg-[var(--color-paper)]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2.5 transition ${
                isActive ? 'text-[var(--color-clay-deep)]' : 'text-[var(--color-ink-faint)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={21} strokeWidth={isActive ? 2.4 : 1.8} />
                <span className="text-[10px] font-500 tracking-wide">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
