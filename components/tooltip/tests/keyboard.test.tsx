// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from '../tooltip';
import { IconButton } from '../../icon-button/icon-button';

afterEach(cleanup);

/** Keyboard per the WAI-ARIA Authoring Practices; keys listed in checks/a11y/apg.ts. */
describe('Tooltip keyboard', () => {
  it('NFR-9: APG tooltip: Tab, Escape — focus shows it, Escape hides it', async () => {
    render(
      <Tooltip content="Copy link to clipboard" delay={0}>
        <IconButton icon="content_copy" label="Copy link" />
      </Tooltip>,
    );
    const user = userEvent.setup();
    await user.tab();
    expect(await screen.findByRole('tooltip')).toBeTruthy();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});
