// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Slider } from '../slider';

afterEach(cleanup);

/** Keyboard per the WAI-ARIA Authoring Practices; keys listed in checks/a11y/apg.ts. */
describe('Slider keyboard', () => {
  it('NFR-9: APG slider: Arrow Right, Arrow Left, Home, End — step and jump', async () => {
    const onChange = vi.fn();
    render(<Slider label="Volume" defaultValue={[50]} minValue={0} maxValue={100} step={10} onChange={onChange} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith([60]);
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(onChange).toHaveBeenLastCalledWith([40]);
    await user.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith([0]);
    await user.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith([100]);
  });
});
