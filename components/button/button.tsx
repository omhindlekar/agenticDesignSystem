import type * as React from 'react';
import { dataState } from '../shared/state';
import '../shared/shared.css';
import './button.css';

export interface ButtonProps {
  label: string;
  variant?: 'contained' | 'outlined' | 'text' | 'primary' | 'secondary' | 'ghost' | 'danger';
  tone?: 'primary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

type Variant = 'contained' | 'outlined' | 'text';

/** Deprecated variant names from before phase 1.7, mapped to the current variant and tone. */
const LEGACY: Record<string, { variant: Variant; tone?: 'danger' }> = {
  primary: { variant: 'contained' },
  secondary: { variant: 'outlined' },
  ghost: { variant: 'text' },
  danger: { variant: 'contained', tone: 'danger' },
};

export function Button({
  label,
  variant = 'contained',
  tone = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  iconStart,
  iconEnd,
  onClick,
  type = 'button',
}: ButtonProps) {
  const inert = disabled || loading;
  const legacy = LEGACY[variant];
  const resolvedVariant: Variant = legacy ? legacy.variant : (variant as Variant);
  const resolvedTone = legacy?.tone ?? tone;

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
      className="ads-button ads-state-layer"
      data-variant={resolvedVariant}
      data-tone={resolvedTone}
      data-size={size}
      data-state={dataState({ disabled, loading }, 'default')}
      aria-disabled={inert || undefined}
      aria-busy={loading || undefined}
      onClick={handleClick}
    >
      {iconStart ? <span className="ads-button__icon">{iconStart}</span> : null}
      <span className="ads-button__label">{label}</span>
      {iconEnd ? <span className="ads-button__icon">{iconEnd}</span> : null}
      {loading ? (
        // Drawn over the hidden label, so the button keeps its width.
        <span className="ads-button__progress" aria-hidden="true">
          <span className="ads-spinner" />
          {/* Shown instead of the spinner under prefers-reduced-motion. */}
          <span className="ads-spinner__text">Loading</span>
        </span>
      ) : null}
      {loading ? <span className="ads-visually-hidden">(loading)</span> : null}
    </button>
  );
}
