import type { ReactNode } from 'react';
import '../shared/shared.css';
import './container.css';

export interface ContainerProps {
  size?: 'sm' | 'md' | 'lg' | 'full';
  children: ReactNode;
}

/** Caps the width of page content, centres it, and keeps the page side margin. */
export function Container({ size = 'lg', children }: ContainerProps) {
  return (
    <div className="ads-container" data-variant={size} data-state="default">
      {children}
    </div>
  );
}
