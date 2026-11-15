import '../shared/shared.css';
import './spinner.css';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

/**
 * An indeterminate loading indicator: a square spinning on a neutral track. Announced
 * as a status by its label; under reduced motion it shows the label as static text.
 */
export function Spinner({ size = 'md', label = 'Loading' }: SpinnerProps) {
  return (
    <span className="ads-spinner-status" role="status" data-variant={size} data-state="default">
      <span className="ads-spinner" aria-hidden="true" />
      <span className="ads-spinner__text" aria-hidden="true">
        {label}
      </span>
      <span className="ads-visually-hidden">{label}</span>
    </span>
  );
}
