import type * as React from 'react';
import { dataState } from '../shared/state';
import '../shared/shared.css';
import './card.css';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'interactive' | 'flat';
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  href?: string;
  'aria-label'?: string;
  as?: React.ElementType;
  selected?: boolean;
  disabled?: boolean;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  onClick,
  href,
  'aria-label': ariaLabel,
  as,
  selected = false,
  disabled = false,
}: CardProps) {
  const common = {
    className: 'ads-card',
    'data-variant': variant,
    'data-padding': padding,
    'data-state': dataState({ selected, disabled }, 'default'),
    'aria-label': ariaLabel,
  };

  // Interactive cards render a native link or button so keyboard and
  // screen-reader support come from the platform.
  if (href !== undefined) {
    return (
      <a
        {...common}
        href={disabled ? undefined : href}
        role={disabled ? 'link' : undefined}
        // Without href a link leaves the tab order; keep it there, like a disabled Button.
        tabIndex={disabled ? 0 : undefined}
        aria-disabled={disabled || undefined}
        aria-current={selected ? 'true' : undefined}
      >
        {children}
      </a>
    );
  }

  if (onClick !== undefined) {
    return (
      <button
        {...common}
        type="button"
        aria-pressed={selected}
        aria-disabled={disabled || undefined}
        onClick={() => {
          if (!disabled) onClick();
        }}
      >
        {children}
      </button>
    );
  }

  const Element: React.ElementType = as ?? 'div';
  return <Element {...common}>{children}</Element>;
}
