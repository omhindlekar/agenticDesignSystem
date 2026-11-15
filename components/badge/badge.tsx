import '../shared/shared.css';
import './badge.css';

export interface BadgeProps {
  variant?: 'status' | 'count' | 'dot';
  label: string;
  count?: number;
  max?: number;
  tone?: 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'danger';
}

/**
 * A small, non-interactive marker: a status word, a count, or a dot. Counts and dots
 * carry their meaning in an accessible label, not in colour alone.
 */
export function Badge({ variant = 'status', label, count = 0, max = 99, tone = 'neutral' }: BadgeProps) {
  if (variant === 'dot') {
    return <span className="ads-badge" data-variant="dot" data-tone={tone} data-state="default" role="img" aria-label={label} />;
  }
  if (variant === 'count') {
    const shown = count > max ? `${max}+` : String(count);
    return (
      <span className="ads-badge" data-variant="count" data-tone={tone} data-state="default" aria-label={`${count} ${label}`}>
        <span aria-hidden="true">{shown}</span>
      </span>
    );
  }
  return (
    <span className="ads-badge" data-variant="status" data-tone={tone} data-state="default">
      {label}
    </span>
  );
}
