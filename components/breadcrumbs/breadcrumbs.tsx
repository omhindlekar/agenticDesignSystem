import { useState } from 'react';
import { Breadcrumb, Breadcrumbs as RacBreadcrumbs, Link } from 'react-aria-components';
import { Icon } from '../icon/icon';
import '../shared/shared.css';
import '../link/link.css';
import './breadcrumbs.css';

export interface BreadcrumbsProps {
  items: Array<{ label: string; href?: string }>;
  maxItems?: number;
}

/**
 * Shows where the current page sits in the hierarchy. The last item is the current page.
 * Long trails collapse to the first and last items, with a button to show the full path.
 */
export function Breadcrumbs({ items, maxItems = 4 }: BreadcrumbsProps) {
  const [expanded, setExpanded] = useState(false);
  const collapse = !expanded && items.length > maxItems;
  const tail = Math.max(1, maxItems - 1);
  const shown = collapse ? [items[0]!, ...items.slice(items.length - tail)] : items;

  return (
    <nav aria-label="Breadcrumbs" className="ads-breadcrumbs" data-variant={collapse ? 'collapsed' : 'full'} data-state="default">
      <RacBreadcrumbs className="ads-breadcrumbs__list">
        {shown.map((item, i) => {
          const last = i === shown.length - 1;
          return (
            <Breadcrumb key={`${item.label}-${i}`} className="ads-breadcrumbs__item">
              {collapse && i === 1 ? (
                <>
                  <button type="button" className="ads-breadcrumbs__more" aria-label="Show full path" onClick={() => setExpanded(true)}>
                    …
                  </button>
                  <span className="ads-breadcrumbs__separator" aria-hidden="true">
                    <Icon name="keyboard_arrow_right" size="sm" />
                  </span>
                </>
              ) : null}
              {last ? (
                <span className="ads-breadcrumbs__current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link className="ads-link ads-breadcrumbs__link" data-variant="standalone" href={item.href ?? '#'}>
                  {item.label}
                </Link>
              )}
              {!last ? (
                <span className="ads-breadcrumbs__separator" aria-hidden="true">
                  <Icon name="keyboard_arrow_right" size="sm" />
                </span>
              ) : null}
            </Breadcrumb>
          );
        })}
      </RacBreadcrumbs>
    </nav>
  );
}
