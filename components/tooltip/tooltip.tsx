import type * as React from 'react';
import { Tooltip as RacTooltip, TooltipTrigger } from 'react-aria-components';
import '../shared/shared.css';
import './tooltip.css';

export interface TooltipProps {
  content: string;
  children: React.ReactElement;
  placement?: 'top' | 'bottom' | 'start' | 'end';
  delay?: number;
}

/**
 * A short text label that appears on hover and keyboard focus and describes its trigger.
 * The trigger must be a Button, IconButton or Link. Escape hides it; it stays while the
 * pointer moves onto it (WCAG 1.4.13).
 */
export function Tooltip({ content, children, placement = 'top', delay = 600 }: TooltipProps) {
  return (
    // display: contents root, so the component exposes its variant without affecting layout.
    <span className="ads-overlay-root" data-variant={placement} data-state="default">
      <TooltipTrigger delay={delay} closeDelay={200}>
        {children}
        <RacTooltip className="ads-tooltip" placement={placement} offset={8}>
          {content}
        </RacTooltip>
      </TooltipTrigger>
    </span>
  );
}
