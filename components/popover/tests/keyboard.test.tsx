// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Popover } from '../popover';
import { Button } from '../../button/button';

afterEach(cleanup);

/** Keyboard per the WAI-ARIA Authoring Practices; keys listed in checks/a11y/apg.ts. */
describe('Popover keyboard', () => {
  it('NFR-9: APG dialog (non-modal): Tab, Escape — move within it, close and return focus', async () => {
    render(
      <Popover title="Share project" trigger={<Button label="Share" />}>
        <Button label="Copy link" />
      </Popover>,
    );
    const user = userEvent.setup();
    const trigger = screen.getByRole('button', { name: 'Share' });
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog');
    await user.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });
});
