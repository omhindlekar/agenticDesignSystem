// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Banner } from '../banner';
import { Button } from '../../button/button';

afterEach(cleanup);

/** Keyboard per the WAI-ARIA Authoring Practices; keys listed in checks/a11y/apg.ts. */
describe('Banner keyboard', () => {
  it('NFR-9: APG alert: Enter — activates the action and the dismiss button; the banner itself takes no focus', async () => {
    const onRetry = vi.fn();
    const onDismiss = vi.fn();
    render(
      <Banner
        tone="danger"
        title="Sync failed"
        actions={<Button label="Retry" onClick={onRetry} />}
        onDismiss={onDismiss}
      >
        We could not reach the server.
      </Banner>,
    );
    const user = userEvent.setup();
    await user.tab();
    expect(document.activeElement?.textContent).toBe('Retry');
    await user.keyboard('{Enter}');
    expect(onRetry).toHaveBeenCalled();
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onDismiss).toHaveBeenCalled();
    expect(screen.getByRole('alert').hasAttribute('tabindex')).toBe(false);
  });
});
