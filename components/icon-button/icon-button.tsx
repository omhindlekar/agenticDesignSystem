import type * as React from 'react';
import { Icon } from '../icon/icon';
import type { IconName } from '../icon/icon';
import { dataState } from '../shared/state';
import '../shared/shared.css';
import './icon-button.css';

export interface IconButtonProps {
  icon: IconName;
  label: string;
  variant?: 'standard' | 'outlined' | 'contained';
  tone?: 'primary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  pressed?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

/** A square button whose only content is an icon. The label names it for assistive tech. */
export function IconButton({
  icon,
  label,
  variant = 'standard',
  tone = 'primary',
  size = 'md',
  pressed,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
}: IconButtonProps) {
  const inert = disabled || loading;

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    // aria-disabled keeps the button focusable, so block activation here.
    if (inert) {
      event.preventDefault();
      return;
    }
    onClick?.();
  }

  return (
    <button
      type={type}
      className="ads-icon-button ads-state-layer"
      data-variant={variant}
      data-tone={tone}
      data-size={size}
      data-state={dataState({ selected: pressed === true, disabled, loading }, 'default')}
      aria-label={label}
      aria-pressed={pressed}
      aria-disabled={inert || undefined}
      aria-busy={loading || undefined}
      onClick={handleClick}
    >
      {/* 20px icons in sm and md buttons, 24px in lg: optically balanced in the square. */}
      <Icon name={icon} size={size === 'lg' ? 'lg' : 'md'} />
      {loading ? (
        <span className="ads-icon-button__progress" aria-hidden="true">
          <span className="ads-spinner" />
          {/* Shown instead of the spinner under prefers-reduced-motion. */}
          <span className="ads-spinner__text">…</span>
        </span>
      ) : null}
    </button>
  );
}
