import { useId } from 'react';
import type { ReactNode } from 'react';
import '../shared/shared.css';
import './page-shell.css';

export interface PageShellProps {
  header?: ReactNode;
  nav?: ReactNode;
  footer?: ReactNode;
  background?: 'page' | 'sunken';
  skipLinkLabel?: string;
  children: ReactNode;
}

/**
 * The frame of a page: optional header, side navigation and footer around the one <main>.
 * With a header or navigation, a skip link is the first thing keyboard users reach.
 */
export function PageShell({
  header,
  nav,
  footer,
  background = 'page',
  skipLinkLabel = 'Skip to main content',
  children,
}: PageShellProps) {
  const mainId = useId();
  return (
    <div className="ads-page-shell" data-variant={background} data-state="default">
      {(header !== undefined || nav !== undefined) && (
        <a className="ads-page-shell__skip" href={`#${mainId}`}>
          {skipLinkLabel}
        </a>
      )}
      {header}
      <div className="ads-page-shell__body">
        {nav !== undefined && <div className="ads-page-shell__nav">{nav}</div>}
        <main id={mainId} tabIndex={-1} className="ads-page-shell__main">
          {children}
        </main>
      </div>
      {footer !== undefined && <footer className="ads-page-shell__footer">{footer}</footer>}
    </div>
  );
}
