import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './app-header.meta.json';
import { AppHeader } from './app-header';
import { SearchField } from '../search-field/search-field';
import { IconButton } from '../icon-button/icon-button';

/** Do and don't examples for the AppHeader usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'When search is the main task, show the field in the header.',
        example: (
          <AppHeader
            title="Agentic DS"
            layout="wide"
            nav={[{ label: 'Projects', href: '#', current: true }]}
            search={<SearchField label="Search" hideLabel placeholder="Search" />}
          />
        ),
      },
      dont: {
        caption: "Don't hide the main task behind an icon.",
        antiPattern: 'Hiding search behind an icon when it is the main task',
        example: (
          <AppHeader
            title="Agentic DS"
            layout="wide"
            nav={[{ label: 'Projects', href: '#', current: true }]}
            actions={<IconButton icon="search" label="Search" />}
          />
        ),
      },
    },
  ],
  textOnly: {
    'Several headers on one page': 'A page-level layout choice; one header fills the example frame already.',
  },
};

const meta = {
  title: 'Usage/AppHeader',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
