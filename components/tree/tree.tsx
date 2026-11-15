import { Button, Tree as RacTree, TreeItem, TreeItemContent } from 'react-aria-components';
import type { Key } from 'react-aria-components';
import { Icon } from '../icon/icon';
import type { IconName } from '../icon/icon';
import '../shared/shared.css';
import './tree.css';

export interface TreeNode {
  id: string;
  label: string;
  icon?: IconName;
  children?: TreeNode[];
}

export interface TreeProps {
  label: string;
  items: TreeNode[];
  defaultExpandedKeys?: string[];
  selectionMode?: 'none' | 'single';
  onAction?: (id: string) => void;
}

function Node({ node }: { node: TreeNode }) {
  return (
    <TreeItem id={node.id} textValue={node.label} className="ads-tree__item">
      <TreeItemContent>
        {({ hasChildItems, level }) => (
          <span className="ads-tree__row" data-level={level}>
            <span className="ads-tree__indent" aria-hidden="true">
              {Array.from({ length: level - 1 }, (_, i) => (
                <span key={i} className="ads-tree__step" />
              ))}
            </span>
            {hasChildItems ? (
              <Button slot="chevron" className="ads-tree__chevron">
                <Icon name="keyboard_arrow_right" />
              </Button>
            ) : (
              <span className="ads-tree__chevron-space" aria-hidden="true" />
            )}
            {node.icon ? <Icon name={node.icon} /> : null}
            <span className="ads-tree__label">{node.label}</span>
          </span>
        )}
      </TreeItemContent>
      {node.children?.map((child) => <Node key={child.id} node={child} />)}
    </TreeItem>
  );
}

/** Hierarchical items such as folders and files. Arrow Right expands, Left collapses, Enter activates. */
export function Tree({ label, items, defaultExpandedKeys, selectionMode = 'none', onAction }: TreeProps) {
  return (
    <div className="ads-tree-root" data-variant={selectionMode} data-state="default">
      <RacTree
        className="ads-tree"
        aria-label={label}
        selectionMode={selectionMode}
        {...(defaultExpandedKeys ? { defaultExpandedKeys: new Set<Key>(defaultExpandedKeys) } : {})}
        {...(onAction ? { onAction: (k: Key) => onAction(String(k)) } : {})}
      >
        {items.map((node) => (
          <Node key={node.id} node={node} />
        ))}
      </RacTree>
    </div>
  );
}
