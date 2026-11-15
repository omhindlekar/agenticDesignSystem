import type * as React from 'react';
import { Dialog, DialogTrigger, Heading, Popover as RacPopover } from 'react-aria-components';
import '../shared/shared.css';
import '../shared/popover.css';
import './popover.css';

export interface PopoverProps {
  title: string;
  trigger: React.ReactElement;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'start' | 'end';
}

/**
 * Rich, interactive content anchored to a trigger, such as a share panel or a short form.
 * It is a dialog named by its title; Escape or clicking outside closes it and focus
 * returns to the trigger.
 */
export function Popover({ title, trigger, children, placement = 'bottom' }: PopoverProps) {
  return (
    <span className="ads-overlay-root" data-variant={placement} data-state="default">
      <DialogTrigger>
        {trigger}
        <RacPopover className="ads-popover ads-popover-panel" placement={placement} offset={8}>
          <Dialog className="ads-popover-panel__dialog">
            <Heading slot="title" className="ads-popover-panel__title">
              {title}
            </Heading>
            <div className="ads-popover-panel__body">{children}</div>
          </Dialog>
        </RacPopover>
      </DialogTrigger>
    </span>
  );
}
