// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { SettingsPage } from '../settings-page';

afterEach(cleanup);
const before = (a: Node, b: Node) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;

describe('SettingsPage', () => {
  const nav = <nav aria-label="Settings">Profile</nav>;
  it('NFR-9: one main landmark and an h1 title', () => {
    render(<SettingsPage title="Settings"><p>Sections</p></SettingsPage>);
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeTruthy();
  });

  it('FR-3: the danger zone always comes after every other section', () => {
    render(
      <SettingsPage title="Settings" dangerZone={<button type="button">Delete account</button>}>
        <button type="button">Save profile</button>
      </SettingsPage>,
    );
    expect(before(screen.getByRole('button', { name: 'Save profile' }), screen.getByRole('button', { name: 'Delete account' }))).toBe(true);
  });

  it('FR-3: settings navigation shows only in the with-nav variant, before the sections', () => {
    const { rerender } = render(<SettingsPage title="Settings" nav={nav}><p>Sections</p></SettingsPage>);
    expect(screen.queryByRole('navigation', { name: 'Settings' })).toBeNull();
    rerender(<SettingsPage variant="with-nav" title="Settings" nav={nav}><p>Sections</p></SettingsPage>);
    expect(before(screen.getByRole('navigation', { name: 'Settings' }), screen.getByText('Sections'))).toBe(true);
  });
});
