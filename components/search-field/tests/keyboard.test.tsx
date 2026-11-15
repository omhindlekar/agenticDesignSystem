// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchField } from '../search-field';

afterEach(cleanup);

/** Keyboard per the WAI-ARIA Authoring Practices; keys listed in checks/a11y/apg.ts. */
describe('SearchField keyboard', () => {
  it('NFR-9: APG search landmark text field: Enter, Escape — submit and clear', async () => {
    const onSubmit = vi.fn();
    const onClear = vi.fn();
    render(<SearchField label="Search" onSubmit={onSubmit} onClear={onClear} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('tokens{Enter}');
    expect(onSubmit).toHaveBeenLastCalledWith('tokens');
    await user.keyboard('{Escape}');
    expect(onClear).toHaveBeenCalled();
    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('');
  });
});
