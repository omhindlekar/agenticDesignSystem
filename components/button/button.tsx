import type * as React from 'react';
import { dataState } from '../shared/state';
import '../shared/shared.css';
import './button.css';

export interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  iconStart,
  iconEnd,
  onClick,
  type = 'button',
}: ButtonProps) {
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
      className="ads-button"
      data-variant={variant}
      data-size={size}
      data-state={dataState({ disabled, loading }, 'default')}
      aria-disabled={inert || undefined}
      aria-busy={loading || undefined}
      onClick={handleClick}
    >
      {loading ? <span className="ads-spinner" aria-hidden="true" /> : iconStart}
      <span className="ads-button__label">{label}</span>
      {loading ? <span className="ads-visually-hidden">(loading)</span> : iconEnd}
    </button>
  );
}
