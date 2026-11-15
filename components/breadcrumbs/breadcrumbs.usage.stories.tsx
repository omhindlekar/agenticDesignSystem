import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './breadcrumbs.meta.json';
import { Breadcrumbs } from './breadcrumbs';

/** Do and don't examples for the Breadcrumbs usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'End with the current page as plain text.',
        example: (
          <Breadcrumbs
            items={[{ label: 'Home', href: '#' }, { label: 'Components', href: '#' }, { label: 'Button' }]}
          />
        ),
      },
      dont: {
        caption: "Don't link the page people are already on.",
        antiPattern: 'Linking the current page',
        example: (
          <Breadcrumbs
            items={[
              { label: 'Home', href: '#' },
              { label: 'Components', href: '#' },
              { label: 'Button', href: '#' },
            ]}
          />
        ),
      },
    },
  ],
  textOnly: {
    'Using breadcrumbs for steps in a process':
      'Breadcrumbs show where a page sits in a hierarchy; a step indicator is a different component.',
  },
};

const meta = {
  title: 'Usage/Breadcrumbs',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
