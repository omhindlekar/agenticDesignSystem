import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './tag-group.meta.json';
import { TagGroup } from './tag-group';

/** Do and don't examples for the TagGroup usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Keep tags to a word or two.',
        example: (
          <TagGroup
            label="Topics"
            tags={[
              { id: 'r', label: 'React' },
              { id: 't', label: 'Tokens' },
              { id: 'a', label: 'Accessibility' },
            ]}
          />
        ),
      },
      dont: {
        caption: "Don't put sentences in tags.",
        antiPattern: 'Long sentences in tags',
        example: (
          <TagGroup
            label="Topics"
            tags={[
              { id: 'r', label: 'This project uses React for every screen' },
              { id: 't', label: 'Tokens are the source of truth' },
            ]}
          />
        ),
      },
    },
  ],
  textOnly: {
    'Mixing removable and selectable behaviour in one group':
      'TagGroup takes one behaviour per group; the mix cannot be built with it.',
  },
};

const meta = {
  title: 'Usage/TagGroup',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
