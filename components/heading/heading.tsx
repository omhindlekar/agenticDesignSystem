import type * as React from 'react';
import '../shared/shared.css';
import './heading.css';

export interface HeadingProps {
  level?: 1 | 2 | 3 | 4;
  appearance?: 'display' | 'h1' | 'h2' | 'h3' | 'h4';
  children: React.ReactNode;
}

/**
 * A heading at a semantic level (h1-h4). appearance changes the look without changing the
 * level, so the document outline stays correct.
 */
export function Heading({ level = 2, appearance, children }: HeadingProps) {
  const Element = `h${level}` as const;
  return (
    <Element className="ads-heading" data-variant={appearance ?? `h${level}`} data-state="default">
      {children}
    </Element>
  );
}
