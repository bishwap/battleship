import type { ReactNode } from 'react';

type StatusBarProps = {
  status: string;
  children?: ReactNode;
};

export function StatusBar({ status, children }: StatusBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-ocean/95 backdrop-blur border-t border-grid">
      {children}
      <div
        className="h-12 flex items-center justify-center px-4 text-center"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="text-sm text-text truncate">{status}</span>
      </div>
    </div>
  );
}
