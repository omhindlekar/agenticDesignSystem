import type { ReactNode } from 'react';
import { EmptyState } from '../empty-state/empty-state';
import { Text } from '../text/text';
import type { IconName } from '../icon/icon';
import '../shared/shared.css';
import './error-page.css';

export interface ErrorPageProps {
  variant?: '404' | '500' | 'offline';
  title?: string;
  description?: string;
  primaryAction: ReactNode;
  secondaryAction?: ReactNode;
}

/** Default copy per error: plain words, what happened and what to do next. */
const COPY: Record<'404' | '500' | 'offline', { code: string; icon: IconName; title: string; description: string }> = {
  '404': {
    code: 'Error 404',
    icon: 'search',
    title: 'We can’t find that page',
    description: 'The link may be out of date, or the page may have moved. Check the address, or go back to the home page.',
  },
  '500': {
    code: 'Error 500',
    icon: 'warning',
    title: 'Something went wrong on our side',
    description: 'It isn’t anything you did. Try again in a few minutes. If it keeps happening, contact support.',
  },
  offline: {
    code: 'No connection',
    icon: 'info',
    title: 'You’re offline',
    description: 'Check your internet connection, then try again. Anything you entered is still here.',
  },
};

/** A full-page error: what went wrong, in plain words, and the way back. */
export function ErrorPage({ variant = '404', title, description, primaryAction, secondaryAction }: ErrorPageProps) {
  const copy = COPY[variant];
  return (
    <div className="ads-error-page" data-variant={variant} data-state="default">
      <EmptyState
        variant="page"
        icon={copy.icon}
        eyebrow={
          <Text variant="overline" as="span" tone="secondary">
            {copy.code}
          </Text>
        }
        title={title ?? copy.title}
        description={description ?? copy.description}
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
      />
    </div>
  );
}
