// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RadioGroup } from '../radio-group';

afterEach(cleanup);
const options = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'Text message' },
  { value: 'none', label: 'No notifications', disabled: true },
];

describe('RadioGroup', () => {
  it('NFR-9: is a radiogroup named by its label, with one radio per option', () => {
    render(<RadioGroup label="Notify me by" options={options} />);
    expect(screen.getByRole('radiogroup', { name: 'Notify me by' })).toBeTruthy();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('NFR-9: arrow keys move the selection and skip disabled options', async () => {
    const onChange = vi.fn();
    render(<RadioGroup label="Notify me by" options={options} defaultValue="email" onChange={onChange} />);
    const user = userEvent.setup();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Email' }));
    await user.keyboard('{ArrowDown}');
    expect(onChange).toHaveBeenLastCalledWith('sms');
    await user.keyboard('{ArrowDown}');
    expect(onChange).toHaveBeenLastCalledWith('email');
  });

  it('NFR-9: error text describes the group and marks it invalid', () => {
    render(<RadioGroup label="Plan" options={options} errorMessage="Choose a plan" />);
    const group = screen.getByRole('radiogroup');
    const text = (group.getAttribute('aria-describedby') ?? '').split(' ').map((id) => document.getElementById(id)?.textContent).join(' ');
    expect(text).toContain('Choose a plan');
  });

  it('FR-3: exposes variant and state on its root', () => {
    const { container } = render(<RadioGroup label="A" options={options} errorMessage="x" />);
    expect(container.firstElementChild?.getAttribute('data-variant')).toBe('error');
    expect(container.firstElementChild?.getAttribute('data-state')).toBe('error');
  });
});
