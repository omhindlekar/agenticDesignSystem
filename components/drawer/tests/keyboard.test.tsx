// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Drawer } from '../drawer';
import { Button } from '../../button/button';

afterEach(cleanup);

/** Keyboard per the WAI-ARIA Authoring Practices; keys listed in checks/a11y/apg.ts. */
describe('Drawer keyboard', () => {
  function Harness() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button label="Open" onClick={() => setOpen(true)} />
        <Drawer isOpen={open} onClose={() => setOpen(false)} title="Filters" footer={<Button label="Apply" />}>
          <Button label="Reset" />
        </Drawer>
      </>
    );
  }
  it('NFR-9: APG dialog (modal): Tab, Shift+Tab — focus stays inside the dialog', async () => {
    render(<Harness />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const dialog = await screen.findByRole('dialog');
    for (let i = 0; i < 6; i++) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
    for (let i = 0; i < 6; i++) {
      await user.tab({ shift: true });
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });
  it('NFR-9: APG dialog (modal): Escape — closes and returns focus to the trigger', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<Harness />);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    vi.useRealTimers();
  });
});
