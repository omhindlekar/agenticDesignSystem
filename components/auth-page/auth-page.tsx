import { useId } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Heading } from '../heading/heading';
import { Text } from '../text/text';
import { Divider } from '../divider/divider';
import '../shared/shared.css';
import './auth-page.css';

export interface AuthPageProps {
  variant?: 'centred' | 'split';
  title: string;
  description?: string;
  brand?: ReactNode;
  children: ReactNode;
  primaryAction: ReactNode;
  secondaryActions?: ReactNode;
  alternative?: ReactNode;
  alternativeLabel?: string;
  footer?: ReactNode;
  aside?: ReactNode;
  asideLabel?: string;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
}

/**
 * Sign-in, sign-up and account recovery screens. Slots, in order: brand, title, description,
 * the form fields (children), secondary actions such as "Forgot your password?", the one
 * primary action, then an alternative (such as single sign-on) after an "or" divider, and a
 * footer. The split variant adds an aside panel for reassurance or brand content.
 */
export function AuthPage({
  variant = 'centred',
  title,
  description,
  brand,
  children,
  primaryAction,
  secondaryActions,
  alternative,
  alternativeLabel = 'or',
  footer,
  aside,
  asideLabel = 'About your account',
  onSubmit,
}: AuthPageProps) {
  const titleId = useId();
  return (
    <div className="ads-auth-page" data-variant={variant} data-state="default">
      <div className="ads-auth-page__panels">
        <main className="ads-auth-page__main">
          {brand !== undefined && <div className="ads-auth-page__brand">{brand}</div>}
          <div className="ads-auth-page__content">
            <form
              className="ads-auth-page__form"
              aria-labelledby={titleId}
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit?.(e);
              }}
            >
              <div className="ads-auth-page__intro">
                <div id={titleId}>
                  <Heading level={1}>{title}</Heading>
                </div>
                {description && (
                  <Text variant="body1" tone="secondary">
                    {description}
                  </Text>
                )}
              </div>
              {children}
              {secondaryActions !== undefined && <div className="ads-auth-page__secondary">{secondaryActions}</div>}
              <div className="ads-auth-page__primary">{primaryAction}</div>
            </form>
            {alternative !== undefined && (
              <div className="ads-auth-page__alternative">
                <div className="ads-auth-page__or">
                  <Divider />
                  <Text variant="caption" as="span" tone="secondary">
                    {alternativeLabel}
                  </Text>
                  <Divider />
                </div>
                {alternative}
              </div>
            )}
          </div>
        </main>
        {variant === 'split' && aside !== undefined && (
          <aside className="ads-auth-page__aside" aria-label={asideLabel}>
            <div className="ads-auth-page__aside-inner">{aside}</div>
          </aside>
        )}
      </div>
      {footer !== undefined && <footer className="ads-auth-page__footer">{footer}</footer>}
    </div>
  );
}
