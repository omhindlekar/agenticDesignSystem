import type { ReactNode } from 'react';
import '../shared/shared.css';
import './stack.css';

export interface StackProps {
  direction?: 'vertical' | 'horizontal';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'section';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between';
  wrap?: boolean;
  children: ReactNode;
}

/** Lays children out in one direction with a gap from the spacing scale. */
export function Stack({
  direction = 'vertical',
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  children,
}: StackProps) {
  return (
    <div
      className="ads-stack"
      data-variant={direction}
      data-state="default"
      data-gap={gap}
      data-align={align}
      data-justify={justify}
      data-wrap={wrap || undefined}
    >
      {children}
    </div>
  );
}
