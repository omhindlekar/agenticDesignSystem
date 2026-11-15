// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NumberField } from '../number-field';

afterEach(cleanup);

/** Keyboard per the WAI-ARIA Authoring Practices; keys listed in checks/a11y/apg.ts. */
describe('NumberField keyboard', () => {
  it('NFR-9: APG spinbutton: Arrow Up, Arrow Down — step the value', async () => {
    const onChange = vi.fn();
    render(<NumberField label="Seats" defaultValue={5} onChange={onChange} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{ArrowUp}');
    expect(onChange).toHaveBeenLastCalledWith(6);
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(onChange).toHaveBeenLastCalledWith(4);
  });
});
