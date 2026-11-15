// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from '../tooltip';
import { IconButton } from '../../icon-button/icon-button';

afterEach(cleanup);

describe('Tooltip', () => {
  it('NFR-9: keyboard focus shows it and the trigger is described by it', async () => {
    render(
      <Tooltip content="Copy link to clipboard">
        <IconButton icon="content_copy" label="Copy link" />
      </Tooltip>,
    );
    const user = userEvent.setup();
    await user.tab();
    const tip = await screen.findByRole('tooltip');
    expect(tip.textContent).toBe('Copy link to clipboard');
    expect(screen.getByRole('button', { name: 'Copy link' }).getAttribute('aria-describedby')).toBe(tip.id);
  });

  it('NFR-9: Escape hides it (SC 1.4.13 dismissible)', async () => {
    render(
      <Tooltip content="Copy link to clipboard">
        <IconButton icon="content_copy" label="Copy link" />
      </Tooltip>,
    );
    const user = userEvent.setup();
    await user.tab();
    await screen.findByRole('tooltip');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});
