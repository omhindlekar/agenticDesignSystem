import { useId } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { PageShell } from '../page-shell/page-shell';
import { Container } from '../container/container';
import { Heading } from '../heading/heading';
import { Text } from '../text/text';
import '../shared/shared.css';
import './form-page.css';

export interface FormPageProps {
  variant?: 'single-column' | 'with-summary';
  title: string;
  description?: string;
  header?: ReactNode;
  backLink?: ReactNode;
  children: ReactNode;
  summary?: ReactNode;
  actions: ReactNode;
  footer?: ReactNode;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
}

/**
 * A page whose job is one form: checkout, account details, an application. Slots, in order:
 * back link, title, description, the form sections (children, one Section per group of
 * fields), then the actions. with-summary adds a summary, such as an order summary: beside the
 * form on wide screens, and above it on narrow ones, so the total is seen before submitting.
 */
export function FormPage({
  variant = 'single-column',
  title,
  description,
  header,
  backLink,
  children,
  summary,
  actions,
  footer,
  onSubmit,
}: FormPageProps) {
  const titleId = useId();
  const withSummary = variant === 'with-summary' && summary !== undefined;
  return (
    <div className="ads-form-page" data-variant={variant} data-state="default">
      <PageShell header={header} footer={footer} background="sunken">
        <Container size={variant === 'with-summary' ? 'lg' : 'md'}>
          <div className="ads-form-page__page">
            <div className="ads-form-page__intro">
              {backLink !== undefined && <div className="ads-form-page__back">{backLink}</div>}
              <div id={titleId}>
                <Heading level={1}>{title}</Heading>
              </div>
              {description && (
                <Text variant="body1" tone="secondary">
                  {description}
                </Text>
              )}
            </div>
            <div className="ads-form-page__layout">
              {withSummary && <div className="ads-form-page__summary">{summary}</div>}
              <form
                className="ads-form-page__form"
                aria-labelledby={titleId}
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  onSubmit?.(e);
                }}
              >
                {children}
                <div className="ads-form-page__actions">{actions}</div>
              </form>
            </div>
          </div>
        </Container>
      </PageShell>
    </div>
  );
}
