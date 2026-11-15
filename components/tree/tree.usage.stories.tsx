import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './tree.meta.json';
import { Tree } from './tree';

/** Do and don't examples for the Tree usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Keep trees shallow, or add search for deep ones.',
        example: (
          <Tree
            label="Files"
            defaultExpandedKeys={['c']}
            items={[
              {
                id: 'c',
                label: 'components',
                children: [
                  { id: 'b', label: 'button' },
                  { id: 'k', label: 'card' },
                ],
              },
              { id: 't', label: 'tokens' },
            ]}
          />
        ),
      },
      dont: {
        caption: "Don't nest many levels without a way to search.",
        antiPattern: 'Very deep trees without search',
        example: (
          <Tree
            label="Files"
            defaultExpandedKeys={['1', '2', '3', '4']}
            items={[
              {
                id: '1',
                label: 'src',
                children: [
                  {
                    id: '2',
                    label: 'app',
                    children: [
                      {
                        id: '3',
                        label: 'features',
                        children: [{ id: '4', label: 'settings', children: [{ id: '5', label: 'index.ts' }] }],
                      },
                    ],
                  },
                ],
              },
            ]}
          />
        ),
      },
    },
  ],
};

const meta = {
  title: 'Usage/Tree',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
