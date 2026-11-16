// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { DashboardPage } from '../dashboard-page';

afterEach(cleanup);
const before = (a: Node, b: Node) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;

describe('DashboardPage', () => {
  it('NFR-9: one main landmark and an h1 title', () => {
    render(<DashboardPage title="Overview"><p>Content</p></DashboardPage>);
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1, name: 'Overview' })).toBeTruthy();
  });

  it('FR-3: slots render in order: title, filters, actions, KPIs, content, aside', () => {
    render(
      <DashboardPage
        title="Overview"
        filters={<input aria-label="Search" />}
        actions={<button type="button">Export</button>}
        kpis={<p>Balance</p>}
        aside={<p>Tips</p>}
      >
        <p>Transactions</p>
      </DashboardPage>,
    );
    const order = [
      screen.getByRole('heading', { level: 1 }),
      screen.getByLabelText('Search'),
      screen.getByRole('button', { name: 'Export' }),
      screen.getByText('Balance'),
      screen.getByText('Transactions'),
      screen.getByText('Tips'),
    ];
    for (let i = 1; i < order.length; i++) expect(before(order[i - 1]!, order[i]!)).toBe(true);
  });
});
