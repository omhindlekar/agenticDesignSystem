import type { ReactNode } from 'react';
import { PageShell } from '../page-shell/page-shell';
import { Container } from '../container/container';
import { Heading } from '../heading/heading';
import { Text } from '../text/text';
import '../shared/shared.css';
import './dashboard-page.css';

export interface DashboardPageProps {
  title: string;
  description?: string;
  header?: ReactNode;
  nav?: ReactNode;
  filters?: ReactNode;
  actions?: ReactNode;
  kpis?: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
  footer?: ReactNode;
}

/**
 * An overview page. Slots, in order: the page header row (title, description, then filters
 * such as search and a date range, and actions), a row of KPI tiles, the main content, and an
 * optional aside. KPI tiles and the aside wrap below on narrow screens.
 */
export function DashboardPage({
  title,
  description,
  header,
  nav,
  filters,
  actions,
  kpis,
  children,
  aside,
  footer,
}: DashboardPageProps) {
  return (
    <div className="ads-dashboard-page" data-variant="default" data-state="default">
      <PageShell header={header} nav={nav} footer={footer} background="sunken">
        <Container size="full">
          <div className="ads-dashboard-page__page">
            <div className="ads-dashboard-page__header">
              <div className="ads-dashboard-page__intro">
                <Heading level={1}>{title}</Heading>
                {description && (
                  <Text variant="body1" tone="secondary">
                    {description}
                  </Text>
                )}
              </div>
              {(filters !== undefined || actions !== undefined) && (
                <div className="ads-dashboard-page__tools">
                  {filters !== undefined && <div className="ads-dashboard-page__filters">{filters}</div>}
                  {actions !== undefined && <div className="ads-dashboard-page__actions">{actions}</div>}
                </div>
              )}
            </div>
            {kpis !== undefined && <div className="ads-dashboard-page__kpis">{kpis}</div>}
            <div className="ads-dashboard-page__body">
              <div className="ads-dashboard-page__content">{children}</div>
              {aside !== undefined && <div className="ads-dashboard-page__aside">{aside}</div>}
            </div>
          </div>
        </Container>
      </PageShell>
    </div>
  );
}
