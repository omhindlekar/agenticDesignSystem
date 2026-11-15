import { Button as RacButton, ProgressBar as RacProgressBar } from 'react-aria-components';
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

  // React Aria's Button supplies press handling and lets Tooltip, Menu and Popover
  // triggers attach through context. aria-disabled (not disabled) keeps it focusable,
  // so activation is blocked here, and an inert submit button is rendered as type
  // button so it cannot submit its form.
  function handlePress() {
    if (inert) return;
    onClick?.();
  }

  return (
    <RacButton
      type={inert ? 'button' : type}
      className="ads-button ads-state-layer"
      data-variant={resolvedVariant}
      data-tone={resolvedTone}
      data-size={size}
      data-state={dataState({ disabled, loading }, 'default')}
      {...(inert ? { 'aria-disabled': true } : {})}
      isPending={loading}
      onPress={handlePress}
    >
      {iconStart ? <span className="ads-button__icon">{iconStart}</span> : null}
      <span className="ads-button__label">{label}</span>
      {iconEnd ? <span className="ads-button__icon">{iconEnd}</span> : null}
      {loading ? (
        // Drawn over the hidden label, so the button keeps its width. React Aria's pending
        // state links this progress bar to the button and announces the change.
        <RacProgressBar isIndeterminate aria-label="Loading" className="ads-button__progress">
          <span className="ads-spinner" aria-hidden="true" />
          {/* Shown instead of the spinner under prefers-reduced-motion. */}
          <span className="ads-spinner__text" aria-hidden="true">
            Loading
          </span>
        </RacProgressBar>
      ) : null}
    </RacButton>
  );
}
