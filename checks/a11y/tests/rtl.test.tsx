// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { I18nProvider } from 'react-aria-components';
import { Icon } from '../../../components/icon/icon';
import { Tabs } from '../../../components/tabs/tabs';
import { Slider } from '../../../components/slider/slider';
import { Tree } from '../../../components/tree/tree';
import { Menu } from '../../../components/menu/menu';

afterEach(cleanup);

/** A right-to-left locale, as the Storybook direction toolbar sets it. */
const rtl = (ui: ReactNode) =>
  render(
    <div dir="rtl">
      <I18nProvider locale="he-IL">{ui}</I18nProvider>
    </div>,
  );

describe('NFR-9 right to left (DS-L-004)', () => {
  it('NFR-9: directional icons are marked to mirror; others are not', () => {
    const { container } = render(
      <>
        <Icon name="keyboard_arrow_right" />
        <Icon name="arrow_back" />
        <Icon name="check" />
        <Icon name="search" />
      </>,
    );
    const marks = [...container.querySelectorAll('svg')].map((s) => s.getAttribute('data-mirror'));
    expect(marks).toEqual(['rtl', 'rtl', null, null]);
  });

  it('NFR-9: Tabs — Arrow Left moves to the next tab in right to left', async () => {
    const tabs = [
      { id: 'a', label: 'Overview', content: 'A' },
      { id: 'b', label: 'Activity', content: 'B' },
    ];
    rtl(<Tabs label="Project" tabs={tabs} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Activity' }).getAttribute('aria-selected')).toBe('true');
  });

  it('NFR-9: Slider — Arrow Left increases the value in right to left', async () => {
    const onChange = vi.fn();
    rtl(<Slider label="Volume" defaultValue={[50]} step={10} onChange={onChange} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{ArrowLeft}');
    expect(onChange).toHaveBeenLastCalledWith([60]);
  });

  it('NFR-9: Tree — Arrow Left expands and Arrow Right collapses in right to left', async () => {
    rtl(<Tree label="Files" items={[{ id: 'p', label: 'components', children: [{ id: 'c', label: 'button' }] }]} />);
    const user = userEvent.setup();
    await user.tab();
    const row = screen.getAllByRole('row')[0]!;
    await user.keyboard('{ArrowLeft}');
    expect(row.getAttribute('aria-expanded')).toBe('true');
    await user.keyboard('{ArrowRight}');
    expect(row.getAttribute('aria-expanded')).toBe('false');
  });

  it('NFR-9: Menu — Arrow Left opens a submenu in right to left', async () => {
    rtl(
      <Menu
        label="Actions"
        items={[{ id: 'move', label: 'Move to', children: [{ id: 'archive', label: 'Archive' }] }]}
      />,
    );
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard('{Enter}{ArrowLeft}');
    expect(screen.getAllByRole('menu')).toHaveLength(2);
  });
});
