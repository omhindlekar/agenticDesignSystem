// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SegmentedControl } from '../segmented-control';

afterEach(cleanup);

/** Keyboard per the WAI-ARIA Authoring Practices; keys listed in checks/a11y/apg.ts. */
describe('SegmentedControl keyboard', () => {
  it('NFR-9: APG radio group (segmented): Arrow Right, Arrow Left — move between segments', async () => {
    const options = [
      { value: 'list', label: 'List' },
      { value: 'grid', label: 'Grid' },
      { value: 'board', label: 'Board' },
    ];
    render(<SegmentedControl label="View" options={options} defaultValue={['list']} />);
    const user = userEvent.setup();
    await user.tab();
    const first = document.activeElement;
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement?.textContent).toContain('Grid');
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(first);
  });
});
