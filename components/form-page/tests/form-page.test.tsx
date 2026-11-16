// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import { FormPage } from '../form-page';

afterEach(cleanup);
const before = (a: Node, b: Node) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;

describe('FormPage', () => {
  it('NFR-9: one main landmark, an h1 title and a form named by it, with actions after the sections', () => {
    render(
      <FormPage title="Checkout" actions={<button type="submit">Place order</button>}>
        <section aria-label="Shipping address"><input aria-label="Street" /></section>
      </FormPage>,
    );
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getByRole('form', { name: 'Checkout' })).toBeTruthy();
    expect(before(screen.getByLabelText('Street'), screen.getByRole('button', { name: 'Place order' }))).toBe(true);
  });

  it('FR-3: the summary shows only in the with-summary variant, before the form in source order so the total is seen first', () => {
    const summary = <aside aria-label="Order summary">Total</aside>;
    const { rerender } = render(
      <FormPage title="Checkout" summary={summary} actions={<button type="submit">Place order</button>}>
        <p>Fields</p>
      </FormPage>,
    );
    expect(screen.queryByRole('complementary', { name: 'Order summary' })).toBeNull();
    rerender(
      <FormPage variant="with-summary" title="Checkout" summary={summary} actions={<button type="submit">Place order</button>}>
        <p>Fields</p>
      </FormPage>,
    );
    const s = screen.getByRole('complementary', { name: 'Order summary' });
    expect(within(screen.getByRole('form')).queryByText('Total')).toBeNull();
    expect(before(s, screen.getByRole('form'))).toBe(true);
  });

  it('FR-3: a back link sits above the title', () => {
    render(
      <FormPage title="Edit profile" backLink={<a href="#back">Back to settings</a>} actions={<button type="submit">Save</button>}>
        <p>Fields</p>
      </FormPage>,
    );
    expect(before(screen.getByRole('link', { name: 'Back to settings' }), screen.getByRole('heading', { level: 1 }))).toBe(true);
  });
});
