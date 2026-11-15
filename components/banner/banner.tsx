import type * as React from 'react';
import { Icon } from '../icon/icon';
import type { IconName } from '../icon/icon';
import { IconButton } from '../icon-button/icon-button';
import '../shared/shared.css';
import './banner.css';

export interface BannerProps {
  tone?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
}

const ICONS: Record<NonNullable<BannerProps['tone']>, IconName> = {
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  danger: 'report',
};

/**
 * An inline message about the page or a section: tonal fill, status icon, title,
 * body, optional actions and dismiss. Danger and warning interrupt (role alert).
 */
export function Banner({ tone = 'info', title, children, actions, onDismiss, dismissLabel = 'Dismiss' }: BannerProps) {
  return (
    <div
      className="ads-banner"
      data-variant={tone}
      data-state="default"
      role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'}
    >
      <span className="ads-banner__icon">
        <Icon name={ICONS[tone]} />
      </span>
      <div className="ads-banner__content">
        {title ? <p className="ads-banner__title">{title}</p> : null}
        {children ? <div className="ads-banner__body">{children}</div> : null}
        {actions ? <div className="ads-banner__actions">{actions}</div> : null}
      </div>
      {onDismiss ? (
        <span className="ads-banner__dismiss">
          <IconButton icon="close" label={dismissLabel} size="sm" onClick={onDismiss} />
        </span>
      ) : null}
    </div>
  );
}
