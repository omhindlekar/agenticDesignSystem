import '../shared/shared.css';
import './icon.css';
import { ICON_PATHS, ICON_VIEWBOX } from './icons.generated';
import type { IconName } from './icons.generated';

export type { IconName } from './icons.generated';

export interface IconProps {
  name: IconName;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

/**
 * One icon from the curated Material Symbols Sharp set, drawn in currentColor.
 * Without a label it is decorative and hidden from assistive tech; with a label
 * it is an image named by that label.
 */
export function Icon({ name, size = 'md', label }: IconProps) {
  const labelled = label !== undefined && label.length > 0;
  return (
    <svg
      className="ads-icon"
      data-variant={labelled ? 'labelled' : 'decorative'}
      data-size={size}
      data-state="default"
      viewBox={ICON_VIEWBOX}
      fill="currentColor"
      focusable="false"
      {...(labelled ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}
