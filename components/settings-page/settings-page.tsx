import type { ReactNode } from 'react';
import { PageShell } from '../page-shell/page-shell';
import { Container } from '../container/container';
import { Heading } from '../heading/heading';
import { Text } from '../text/text';
import '../shared/shared.css';
import './settings-page.css';

export interface SettingsPageProps {
  variant?: 'with-nav' | 'single';
  title: string;
  description?: string;
  header?: ReactNode;
  nav?: ReactNode;
  children: ReactNode;
  dangerZone?: ReactNode;
  footer?: ReactNode;
}

/**
 * Account and app settings. Slots, in order: title, description, an optional settings
 * navigation (with-nav), the setting sections (children, one Section per topic), and the
 * danger zone, which is always last so destructive actions never sit among everyday ones.
 */
export function SettingsPage({
  variant = 'single',
  title,
  description,
  header,
  nav,
  children,
  dangerZone,
  footer,
}: SettingsPageProps) {
  return (
    <div className="ads-settings-page" data-variant={variant} data-state="default">
      <PageShell header={header} footer={footer} background="sunken">
        <Container size={variant === 'with-nav' ? 'lg' : 'md'}>
          <div className="ads-settings-page__page">
            <div className="ads-settings-page__intro">
              <Heading level={1}>{title}</Heading>
              {description && (
                <Text variant="body1" tone="secondary">
                  {description}
                </Text>
              )}
            </div>
            <div className="ads-settings-page__layout">
              {variant === 'with-nav' && nav !== undefined && <div className="ads-settings-page__nav">{nav}</div>}
              <div className="ads-settings-page__sections">
                {children}
                {dangerZone !== undefined && <div className="ads-settings-page__danger">{dangerZone}</div>}
              </div>
            </div>
          </div>
        </Container>
      </PageShell>
    </div>
  );
}
