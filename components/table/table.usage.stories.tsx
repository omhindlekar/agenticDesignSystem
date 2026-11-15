import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './table.meta.json';
import { Table } from './table';

/** Do and don't examples for the Table usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Use a table to compare several attributes.',
        example: (
          <div style={{ width: '100%' }}>
            <Table
              label="Projects"
              columns={[
                { id: 'n', label: 'Name' },
                { id: 'o', label: 'Owner' },
                { id: 'u', label: 'Updated', align: 'end' },
              ]}
              rows={[{ id: '1', cells: { n: 'Tokens', o: 'Om', u: '2026-11-12' } }]}
            />
          </div>
        ),
      },
      dont: {
        caption: "Don't build a one-column table; use a List.",
        antiPattern: 'Tables with a single column',
        example: (
          <div style={{ width: '100%' }}>
            <Table
              label="Projects"
              columns={[{ id: 'n', label: 'Name' }]}
              rows={[
                { id: '1', cells: { n: 'Tokens' } },
                { id: '2', cells: { n: 'Rules' } },
              ]}
            />
          </div>
        ),
      },
    },
  ],
  textOnly: {
    'Putting interactive controls in every cell':
      'Shown in words: every control adds tab stops; use row selection and a row Menu.',
  },
};

const meta = {
  title: 'Usage/Table',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
