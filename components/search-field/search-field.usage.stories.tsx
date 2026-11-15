import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './search-field.meta.json';
import { SearchField } from './search-field';

/** Do and don't examples for the SearchField usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Show the label when the scope is not obvious.',
        example: <SearchField label="Search components" placeholder="Button, Card…" />,
      },
      dont: {
        caption: "Don't hide the label when people cannot tell what is searched.",
        antiPattern: 'Hiding the label when the search scope is not obvious',
        example: <SearchField label="Search components" hideLabel placeholder="Search" />,
      },
    },
  ],
  textOnly: {
    'Submitting on every keystroke for slow searches': 'A behaviour over time; a still example would not show it.',
  },
};

const meta = {
  title: 'Usage/SearchField',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
