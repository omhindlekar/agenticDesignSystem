// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Drawer } from '../drawer';

afterEach(cleanup);

describe('Drawer', () => {
  it('NFR-9: open is a modal dialog named by its title, with focus inside', async () => {
    render(<Drawer isOpen onClose={() => {}} title="Filters">Body</Drawer>);
    const dialog = await screen.findByRole('dialog', { name: 'Filters' });
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('NFR-9: Escape and the Close button call onClose', async () => {
    const onClose = vi.fn();
    render(<Drawer isOpen onClose={onClose} title="Filters">Body</Drawer>);
    const user = userEvent.setup();
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('FR-1: exposes side and size', async () => {
    render(<Drawer isOpen onClose={() => {}} title="Filters" side="start" size="lg">Body</Drawer>);
    const panel = document.querySelector('.ads-drawer');
    expect(panel?.getAttribute('data-variant')).toBe('start');
    expect(panel?.getAttribute('data-size')).toBe('lg');
  });
});
