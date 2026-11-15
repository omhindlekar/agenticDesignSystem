import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './list.meta.json';
import { List } from './list';

/** Do and don't examples for the List usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Keep items the same shape: a title, a description, one detail.',
        example: (
          <div style={{ width: '100%' }}>
            <List
              label="Recent"
              items={[
                { id: 'a', title: 'Tokens', description: 'Updated today', meta: '161' },
                { id: 'b', title: 'Rules', description: 'Updated today', meta: '24' },
              ]}
            />
          </div>
        ),
      },
      dont: {
        caption: "Don't mix very different item shapes in one list.",
        antiPattern: 'Lists with very different item shapes',
        example: (
          <div style={{ width: '100%' }}>
            <List
              label="Recent"
              items={[
                { id: 'a', title: 'Tokens', description: 'Updated today', meta: '161', icon: 'settings' },
                { id: 'b', title: 'A long note that someone pasted here instead of a title, with no description' },
              ]}
            />
          </div>
        ),
      },
    },
  ],
  textOnly: {
    'Several actions per row without a menu': 'Shown in words: put row actions in a Menu so each row has one tab stop.',
  },
};

const meta = {
  title: 'Usage/List',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
