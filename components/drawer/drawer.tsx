import type * as React from 'react';
import { Dialog, Heading, Modal, ModalOverlay } from 'react-aria-components';
import { IconButton } from '../icon-button/icon-button';
import '../shared/shared.css';
import './drawer.css';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: 'start' | 'end';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * A panel that slides in from the side of the screen over the page, for filters, details
 * or secondary tasks. Modal: focus is trapped, Escape or the scrim closes it.
 */
export function Drawer({ isOpen, onClose, title, children, footer, side = 'end', size = 'md' }: DrawerProps) {
  return (
    <span className="ads-overlay-root" data-variant={side} data-state="default">
      <ModalOverlay
        className="ads-drawer-overlay"
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
        isDismissable
      >
        <Modal className="ads-drawer" data-variant={side} data-size={size} data-state="default">
          <Dialog className="ads-drawer__dialog">
            <header className="ads-drawer__header">
              <Heading slot="title" className="ads-drawer__title">
                {title}
              </Heading>
              <IconButton icon="close" label="Close" size="sm" onClick={onClose} />
            </header>
            <div className="ads-drawer__body">{children}</div>
            {footer ? <footer className="ads-drawer__footer">{footer}</footer> : null}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </span>
  );
}
