import { Separator } from 'react-aria-components';
import '../shared/shared.css';
import './divider.css';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  inset?: boolean;
}

/** A 1px line that separates groups of content. */
export function Divider({ orientation = 'horizontal', inset = false }: DividerProps) {
  return (
    <Separator
      className="ads-divider"
      data-variant={orientation}
      data-inset={inset || undefined}
      data-state="default"
      orientation={orientation}
      {...(orientation === 'vertical' ? { elementType: 'div' } : {})}
    />
  );
}
