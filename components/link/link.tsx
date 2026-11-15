import type * as React from 'react';
import { Link as RacLink } from 'react-aria-components';
import { Icon } from '../icon/icon';
import '../shared/shared.css';
import './link.css';

export interface LinkProps {
  href: string;
  children: React.ReactNode;
  variant?: 'inline' | 'standalone';
  external?: boolean;
}

/**
 * Navigates to another page or resource. Inline links are always underlined, so they are
 * not distinguished by colour alone (WCAG 1.4.1). External links open in a new tab and say so.
 */
export function Link({ href, children, variant = 'inline', external = false }: LinkProps) {
  return (
    <RacLink
      className="ads-link"
      data-variant={variant}
      data-state="default"
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
      {external ? (
        <>
          <Icon name="open_in_new" size="sm" />
          <span className="ads-visually-hidden"> (opens in a new tab)</span>
        </>
      ) : null}
    </RacLink>
  );
}
