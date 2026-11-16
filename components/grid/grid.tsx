import type { ReactNode } from 'react';
import '../shared/shared.css';
import './grid.css';

export interface GridProps {
  columns?: 1 | 2 | 3 | 4 | 6 | 12;
  minItemWidth?: 'sm' | 'md';
  children: ReactNode;
}

/**
 * Up to `columns` equal columns. A column drops whenever an item would be narrower than
 * `minItemWidth`, so the grid collapses on small screens without breakpoints.
 */
export function Grid({ columns = 3, minItemWidth = 'md', children }: GridProps) {
  return (
    <div
      className="ads-grid"
      data-variant="default"
      data-state="default"
      data-min={minItemWidth}
      data-columns={columns}
    >
      {children}
    </div>
  );
}
