import { Button, Label, Tag, TagGroup as RacTagGroup, TagList } from 'react-aria-components';
import type { Key, Selection } from 'react-aria-components';
import { Icon } from '../icon/icon';
import '../shared/shared.css';
import './tag-group.css';

export interface TagGroupProps {
  label: string;
  tags: Array<{ id: string; label: string; tone?: 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'danger' }>;
  selectionMode?: 'none' | 'single' | 'multiple';
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  onRemove?: (ids: string[]) => void;
  showLabel?: boolean;
}

/**
 * Short keywords that label, categorise or filter content. Tags can be static,
 * selectable (as filters) or removable; Backspace and Delete remove the focused tag.
 */
export function TagGroup({ label, tags, selectionMode = 'none', selectedKeys, onSelectionChange, onRemove, showLabel = false }: TagGroupProps) {
  return (
    <RacTagGroup
      className="ads-tag-group"
      data-variant={onRemove ? 'removable' : selectionMode === 'none' ? 'static' : 'selectable'}
      data-state="default"
      selectionMode={selectionMode}
      {...(selectedKeys ? { selectedKeys: new Set<Key>(selectedKeys) } : {})}
      {...(onSelectionChange
        ? { onSelectionChange: (keys: Selection) => onSelectionChange(keys === 'all' ? tags.map((t) => t.id) : [...keys].map(String)) }
        : {})}
      {...(onRemove ? { onRemove: (keys: Set<Key>) => onRemove([...keys].map(String)) } : {})}
    >
      <Label className={showLabel ? 'ads-field__label' : 'ads-visually-hidden'}>{label}</Label>
      <TagList className="ads-tag-group__list">
        {tags.map((t) => (
          <Tag key={t.id} id={t.id} textValue={t.label} className="ads-tag" data-tone={t.tone ?? 'neutral'}>
            {({ allowsRemoving, isSelected }) => (
              <>
                {isSelected ? <Icon name="check" size="sm" /> : null}
                <span>{t.label}</span>
                {allowsRemoving ? (
                  <Button slot="remove" className="ads-tag__remove" aria-label="Remove">
                    <Icon name="close" size="sm" />
                  </Button>
                ) : null}
              </>
            )}
          </Tag>
        ))}
      </TagList>
    </RacTagGroup>
  );
}
