// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastRegion, toast, toastQueue } from '../toast-region';
import { Button } from '../../button/button';

afterEach(cleanup);

/** Keyboard per the WAI-ARIA Authoring Practices; keys listed in checks/a11y/apg.ts. */
describe('ToastRegion keyboard', () => {
  afterEach(() => {
    act(() => toastQueue.clear());
  });
  it('NFR-9: APG alert + landmark region: F6, Enter — jump to the notifications and act on a toast', async () => {
    const onAction = vi.fn();
    render(
      <>
        <Button label="Elsewhere" />
        <ToastRegion />
      </>,
    );
    act(() => {
      toast({ title: 'Item deleted', action: { label: 'Undo', onAction } });
    });
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{F6}');
    const region = screen.getByRole('region', { name: /notification/i });
    expect(region.contains(document.activeElement)).toBe(true);
    // The toast itself is the first stop in the region, then its controls.
    for (let i = 0; i < 3 && document.activeElement?.textContent !== 'Undo'; i++) await user.tab();
    expect(document.activeElement?.textContent).toBe('Undo');
    await user.keyboard('{Enter}');
    expect(onAction).toHaveBeenCalled();
  });
});
