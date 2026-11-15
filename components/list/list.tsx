import { GridList, GridListItem } from 'react-aria-components';
import type { Key, Selection } from 'react-aria-components';
import { Icon } from '../icon/icon';
import type { IconName } from '../icon/icon';
import '../shared/shared.css';
import './list.css';

export interface ListProps {
  label: string;
  items: Array<{ id: string; title: string; description?: string; meta?: string; icon?: IconName }>;
  selectionMode?: 'none' | 'single' | 'multiple';
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  onAction?: (id: string) => void;
}

function Row({ item }: { item: ListProps['items'][number] }) {
  return (
    <>
      {item.icon ? (
        <span className="ads-list__icon">
          <Icon name={item.icon} />
        </span>
      ) : null}
      <span className="ads-list__text">
        <span className="ads-list__title">{item.title}</span>
        {item.description ? <span className="ads-list__description">{item.description}</span> : null}
      </span>
      {item.meta ? <span className="ads-list__meta">{item.meta}</span> : null}
    </>
  );
}

/**
 * A vertical list of items with a title, description, leading icon and trailing meta.
 * Static lists are plain lists; with selection or an action it becomes a keyboard grid list.
 */
export function List({ label, items, selectionMode = 'none', selectedKeys, onSelectionChange, onAction }: ListProps) {
  const interactive = selectionMode !== 'none' || onAction !== undefined;
  if (!interactive) {
    return (
      <ul className="ads-list" data-variant="static" data-state="default" aria-label={label}>
        {items.map((item) => (
          <li key={item.id} className="ads-list__item">
            <Row item={item} />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div className="ads-list-root" data-variant="interactive" data-state="default">
      <GridList
        className="ads-list"
        aria-label={label}
        selectionMode={selectionMode}
        {...(selectedKeys ? { selectedKeys: new Set<Key>(selectedKeys) } : {})}
        {...(onSelectionChange
          ? { onSelectionChange: (keys: Selection) => onSelectionChange(keys === 'all' ? items.map((i) => i.id) : [...keys].map(String)) }
          : {})}
        {...(onAction ? { onAction: (k: Key) => onAction(String(k)) } : {})}
      >
        {items.map((item) => (
          <GridListItem key={item.id} id={item.id} textValue={item.title} className="ads-list__item ads-list__item--interactive">
            <Row item={item} />
          </GridListItem>
        ))}
      </GridList>
    </div>
  );
}
