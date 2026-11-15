import type * as React from 'react';
import {
  Cell,
  Checkbox,
  Column,
  Row,
  Table as RacTable,
  TableBody,
  TableHeader,
} from 'react-aria-components';
import type { Key, Selection, SortDescriptor } from 'react-aria-components';
import { Icon } from '../icon/icon';
import '../shared/shared.css';
import './table.css';

export interface TableProps {
  label: string;
  columns: Array<{ id: string; label: string; sortable?: boolean; align?: 'start' | 'end' }>;
  rows: Array<{ id: string; cells: Record<string, React.ReactNode> }>;
  sortColumn?: string;
  sortDirection?: 'ascending' | 'descending';
  onSortChange?: (column: string, direction: 'ascending' | 'descending') => void;
  selectionMode?: 'none' | 'single' | 'multiple';
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  emptyState?: string;
}

function SelectionBox() {
  return (
    <Checkbox slot="selection" className="ads-table__check">
      <span className="ads-table__box" aria-hidden="true">
        <span className="ads-table__check-icon">
          <Icon name="check" size="sm" />
        </span>
        <span className="ads-table__dash-icon">
          <Icon name="remove" size="sm" />
        </span>
      </span>
    </Checkbox>
  );
}

/**
 * Rows of data in columns, with sorting, row selection and keyboard grid navigation.
 * Row height follows density.
 */
export function Table({
  label,
  columns,
  rows,
  sortColumn,
  sortDirection = 'ascending',
  onSortChange,
  selectionMode = 'none',
  selectedKeys,
  onSelectionChange,
  emptyState = 'No results',
}: TableProps) {
  const sort: SortDescriptor | undefined = sortColumn ? { column: sortColumn, direction: sortDirection } : undefined;
  return (
    <div className="ads-table" data-variant={selectionMode} data-state="default">
      <RacTable
        className="ads-table__grid"
        aria-label={label}
        selectionMode={selectionMode}
        {...(sort ? { sortDescriptor: sort } : {})}
        {...(onSortChange
          ? { onSortChange: (d: SortDescriptor) => onSortChange(String(d.column), d.direction) }
          : {})}
        {...(selectedKeys ? { selectedKeys: new Set<Key>(selectedKeys) } : {})}
        {...(onSelectionChange
          ? { onSelectionChange: (keys: Selection) => onSelectionChange(keys === 'all' ? rows.map((r) => r.id) : [...keys].map(String)) }
          : {})}
      >
        <TableHeader className="ads-table__head">
          {selectionMode === 'multiple' ? (
            <Column className="ads-table__column ads-table__column--select">
              <SelectionBox />
            </Column>
          ) : null}
          {columns.map((c, i) => (
            <Column
              key={c.id}
              id={c.id}
              isRowHeader={i === 0}
              allowsSorting={c.sortable ?? false}
              className="ads-table__column"
              data-align={c.align ?? 'start'}
            >
              {({ sortDirection: dir, allowsSorting }) => (
                <span className="ads-table__column-label">
                  {c.label}
                  {allowsSorting ? (
                    <span className="ads-table__sort" data-active={dir ? 'true' : undefined} aria-hidden="true">
                      <Icon name={dir === 'descending' ? 'keyboard_arrow_down' : 'keyboard_arrow_up'} size="sm" />
                    </span>
                  ) : null}
                </span>
              )}
            </Column>
          ))}
        </TableHeader>
        <TableBody className="ads-table__body" renderEmptyState={() => <div className="ads-table__empty">{emptyState}</div>}>
          {rows.map((r) => (
            <Row key={r.id} id={r.id} className="ads-table__row">
              {selectionMode === 'multiple' ? (
                <Cell className="ads-table__cell ads-table__cell--select">
                  <SelectionBox />
                </Cell>
              ) : null}
              {columns.map((c) => (
                <Cell key={c.id} className="ads-table__cell" data-align={c.align ?? 'start'}>
                  {r.cells[c.id]}
                </Cell>
              ))}
            </Row>
          ))}
        </TableBody>
      </RacTable>
    </div>
  );
}
