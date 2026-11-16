// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ErrorPage } from '../error-page';

afterEach(cleanup);
const home = <a href="#home">Go to the home page</a>;

describe('ErrorPage', () => {
  it.each([
    ['404', 'We can’t find that page', 'Error 404'],
    ['500', 'Something went wrong on our side', 'Error 500'],
    ['offline', 'You’re offline', 'No connection'],
  ] as const)('FR-3: %s has plain default copy and a code', (variant, title, code) => {
    render(<ErrorPage variant={variant} primaryAction={home} />);
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeTruthy();
    expect(screen.getByText(code)).toBeTruthy();
  });

  it('FR-3: copy can be overridden, and the way back is always present', () => {
    render(<ErrorPage title="This invoice was deleted" description="Ask the sender for a new link." primaryAction={home} />);
    expect(screen.getByRole('heading', { level: 1, name: 'This invoice was deleted' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Go to the home page' })).toBeTruthy();
    expect(screen.getAllByRole('main')).toHaveLength(1);
  });
});
