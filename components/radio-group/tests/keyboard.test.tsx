// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RadioGroup } from '../radio-group';

afterEach(cleanup);

/** Keyboard per the WAI-ARIA Authoring Practices; keys listed in checks/a11y/apg.ts. */
describe('RadioGroup keyboard', () => {
  const options = [
    { value: 'a', label: 'Monthly' },
    { value: 'b', label: 'Yearly' },
    { value: 'c', label: 'Lifetime' },
  ];
  it('NFR-9: APG radio group: Arrow Down, Arrow Up — move and select', async () => {
    const onChange = vi.fn();
    render(<RadioGroup label="Billing" options={options} defaultValue="a" onChange={onChange} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(onChange).toHaveBeenLastCalledWith('b');
    await user.keyboard('{ArrowUp}');
    expect(onChange).toHaveBeenLastCalledWith('a');
  });
  it('NFR-9: APG radio group: Space — selects the focused option', async () => {
    const onChange = vi.fn();
    render(<RadioGroup label="Billing" options={options} onChange={onChange} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenLastCalledWith('a');
  });
});
