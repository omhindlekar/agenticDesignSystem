import { useId } from 'react';
import type { ReactNode } from 'react';
import { Heading } from '../heading/heading';
import { Text } from '../text/text';
import '../shared/shared.css';
import './section.css';

export interface SectionProps {
  title: string;
  description?: string;
  headingLevel?: 2 | 3;
  actions?: ReactNode;
  variant?: 'plain' | 'surface' | 'danger';
  children?: ReactNode;
}

/**
 * A titled region of a page: heading, optional one-line description and actions, then content.
 * The danger variant is the danger zone for destructive actions, always last on a page.
 */
export function Section({ title, description, headingLevel = 2, actions, variant = 'plain', children }: SectionProps) {
  const titleId = useId();
  return (
    <section className="ads-section" data-variant={variant} data-state="default" aria-labelledby={titleId}>
      <div className="ads-section__header">
        <div className="ads-section__intro">
          <div id={titleId}>
            <Heading level={headingLevel} appearance={headingLevel === 2 ? 'h3' : 'h4'}>
              {title}
            </Heading>
          </div>
          {description && (
            <Text variant="body2" tone="secondary">
              {description}
            </Text>
          )}
        </div>
        {actions && <div className="ads-section__actions">{actions}</div>}
      </div>
      {children !== undefined && <div className="ads-section__body">{children}</div>}
    </section>
  );
}
