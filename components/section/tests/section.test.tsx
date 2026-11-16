// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Section } from '../section';

afterEach(cleanup);

describe('Section', () => {
  it('NFR-9: is a region named by its heading', () => {
    render(<Section title="Profile"><p>Fields</p></Section>);
    expect(screen.getByRole('region', { name: 'Profile' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: 'Profile' })).toBeTruthy();
  });

  it('FR-3: supports a level 3 heading, a description and actions', () => {
    render(
      <Section title="Danger zone" headingLevel={3} description="These actions can't be undone." actions={<button type="button">Help</button>} variant="danger" />,
    );
    expect(screen.getByRole('heading', { level: 3, name: 'Danger zone' })).toBeTruthy();
    expect(screen.getByText("These actions can't be undone.")).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Help' })).toBeTruthy();
    expect(screen.getByRole('region').dataset['variant']).toBe('danger');
  });

  it('FR-3: renders no empty body when it has no content', () => {
    const { container } = render(<Section title="Empty" />);
    expect(container.querySelector('.ads-section__body')).toBeNull();
  });
});
