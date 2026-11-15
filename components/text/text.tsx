import type * as React from 'react';
import '../shared/shared.css';
import './text.css';

export interface TextProps {
  variant?: 'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'subtitle' | 'body1' | 'body2' | 'label' | 'caption' | 'overline';
  as?: 'p' | 'span' | 'div' | 'strong' | 'em' | 'small';
  tone?: 'primary' | 'secondary' | 'heading';
  children: React.ReactNode;
}

/** Text in any role of the type scale, without writing CSS. For headings use Heading. */
export function Text({ variant = 'body1', as = 'p', tone = 'primary', children }: TextProps) {
  const Element = as;
  return (
    <Element className="ads-text" data-variant={variant} data-tone={tone} data-state="default">
      {children}
    </Element>
  );
}
