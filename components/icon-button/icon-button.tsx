import { Button as RacButton, ProgressBar as RacProgressBar } from 'react-aria-components';
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
      className="ads-icon-button ads-state-layer"
      data-variant={variant}
      data-tone={tone}
      data-size={size}
      data-state={dataState({ selected: pressed === true, disabled, loading }, 'default')}
      aria-label={label}
      {...(pressed !== undefined ? { 'aria-pressed': pressed } : {})}
      {...(inert ? { 'aria-disabled': true } : {})}
      isPending={loading}
      onPress={handlePress}
    >
      {/* 20px icons in sm and md buttons, 24px in lg: optically balanced in the square. */}
      <Icon name={icon} size={size === 'lg' ? 'lg' : 'md'} />
      {loading ? (
        <RacProgressBar isIndeterminate aria-label="Loading" className="ads-icon-button__progress">
          <span className="ads-spinner" aria-hidden="true" />
          {/* Shown instead of the spinner under prefers-reduced-motion. */}
          <span className="ads-spinner__text" aria-hidden="true">
            …
          </span>
        </RacProgressBar>
      ) : null}
    </RacButton>
  );
}
