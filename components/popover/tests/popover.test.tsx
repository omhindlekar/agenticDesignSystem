// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Popover } from '../popover';
import { Button } from '../../button/button';

afterEach(cleanup);

describe('Popover', () => {
  it('NFR-9: the trigger opens a dialog named by its title; Escape closes and returns focus', async () => {
    render(
      <Popover title="Share project" trigger={<Button label="Share" variant="outlined" />}>
        <p>Anyone with the link can view.</p>
      </Popover>,
    );
    const user = userEvent.setup();
    const trigger = screen.getByRole('button', { name: 'Share' });
    await user.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Share project' })).toBeTruthy();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });
});
