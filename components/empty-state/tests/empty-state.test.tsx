// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { EmptyState } from '../empty-state';

afterEach(cleanup);

describe('EmptyState', () => {
  const props = { title: 'No invoices yet', description: 'Invoices you send appear here.', primaryAction: <button type="button">Create invoice</button> };
  it('NFR-9: the page variant is the main landmark with an h1', () => {
    render(<EmptyState variant="page" {...props} />);
    expect(screen.getByRole('main')).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1, name: 'No invoices yet' })).toBeTruthy();
  });

  it('NFR-9: the inline variant sits inside a page, so it adds no main and uses an h2', () => {
    render(<EmptyState {...props} />);
    expect(screen.queryByRole('main')).toBeNull();
    expect(screen.getByRole('heading', { level: 2, name: 'No invoices yet' })).toBeTruthy();
  });

  it('FR-3: shows the description and the action that fills the space', () => {
    render(<EmptyState {...props} secondaryAction={<a href="#learn">Learn about invoices</a>} />);
    expect(screen.getByText('Invoices you send appear here.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Create invoice' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Learn about invoices' })).toBeTruthy();
  });
});
