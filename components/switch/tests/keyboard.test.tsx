// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from '../switch';

afterEach(cleanup);

/** Keyboard per the WAI-ARIA Authoring Practices; keys listed in checks/a11y/apg.ts. */
describe('Switch keyboard', () => {
  it('NFR-9: APG switch: Space — toggles it', async () => {
    const onChange = vi.fn();
    render(<Switch label="Notifications" onChange={onChange} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(
      screen.getByRole('switch').getAttribute('aria-checked') ??
        String((screen.getByRole('switch') as HTMLInputElement).checked),
    ).toBe('true');
  });
});
