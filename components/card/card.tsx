import type * as React from 'react';
import { dataState } from '../shared/state';
import '../shared/shared.css';
import './card.css';

export interface CardProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
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
  title,
  subtitle,
  actions,
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

  // Inside a link or button only phrasing content is valid, so slots render as
  // spans and the title is not a heading. Actions are never rendered there:
  // controls inside an interactive card would be nested interactive elements.
  const interactive = href !== undefined || onClick !== undefined;
  const Slot: React.ElementType = interactive ? 'span' : 'div';
  const Title: React.ElementType = interactive ? 'span' : 'h3';
  const Subtitle: React.ElementType = interactive ? 'span' : 'p';

  const slots = (
    <>
      {title !== undefined || subtitle !== undefined ? (
        <Slot className="ads-card__header">
          {title !== undefined ? <Title className="ads-card__title">{title}</Title> : null}
          {subtitle !== undefined ? <Subtitle className="ads-card__subtitle">{subtitle}</Subtitle> : null}
        </Slot>
      ) : null}
      {children !== undefined ? <Slot className="ads-card__content">{children}</Slot> : null}
      {actions !== undefined && !interactive ? <div className="ads-card__actions">{actions}</div> : null}
    </>
  );

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
        {slots}
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
        {slots}
      </button>
    );
  }

  const Element: React.ElementType = as ?? 'div';
  return <Element {...common}>{slots}</Element>;
}
