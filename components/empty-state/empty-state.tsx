import type { ReactNode } from 'react';
import { Heading } from '../heading/heading';
import { Text } from '../text/text';
import { Icon } from '../icon/icon';
import type { IconName } from '../icon/icon';
import '../shared/shared.css';
import './empty-state.css';

export interface EmptyStateProps {
  variant?: 'page' | 'inline';
  icon?: IconName;
  eyebrow?: ReactNode;
  title: string;
  description: string;
  primaryAction: ReactNode;
  secondaryAction?: ReactNode;
}

/**
 * Nothing to show yet: an icon, a title saying what is empty, one sentence on why or what
 * it is for, and the action that fills it. page fills the screen and owns the h1; inline sits
 * inside a section (h2) with a dashed border.
 */
export function EmptyState({
  variant = 'inline',
  icon,
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
}: EmptyStateProps) {
  const body = (
    <div className="ads-empty-state__body">
      {icon !== undefined && (
        <span className="ads-empty-state__icon">
          <Icon name={icon} size="lg" />
        </span>
      )}
      {eyebrow !== undefined && <div className="ads-empty-state__eyebrow">{eyebrow}</div>}
      <Heading level={variant === 'page' ? 1 : 2} appearance={variant === 'page' ? 'h1' : 'h3'}>
        {title}
      </Heading>
      <Text variant="body1" tone="secondary">
        {description}
      </Text>
      <div className="ads-empty-state__actions">
        {primaryAction}
        {secondaryAction}
      </div>
    </div>
  );
  return variant === 'page' ? (
    <div className="ads-empty-state" data-variant="page" data-state="default">
      <main className="ads-empty-state__main">{body}</main>
    </div>
  ) : (
    <div className="ads-empty-state" data-variant="inline" data-state="default">
      {body}
    </div>
  );
}
