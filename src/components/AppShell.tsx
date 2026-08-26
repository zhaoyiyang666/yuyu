import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { TabBar } from './TabBar';

interface ShellProps {
  children?: ReactNode;
}

/** 移动端应用外壳：居中约束 + 纸张纹理 + 底部导航 */
export function AppShell({ children }: ShellProps) {
  return (
    <div className="min-h-full bg-[var(--color-paper-deep)]">
      <div className="paper-grain relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-[var(--color-paper)] shadow-[0_0_60px_-20px_rgba(43,36,32,0.25)]">
        <main className="no-scrollbar flex-1 overflow-y-auto px-4 pb-6">
          {children ?? <Outlet />}
        </main>
        <TabBar />
      </div>
    </div>
  );
}
