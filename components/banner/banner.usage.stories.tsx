import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './banner.meta.json';
import { Banner } from './banner';

/** Do and don't examples for the Banner usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Use the tone that matches the message: info for news.',
        example: (
          <Banner tone="info" title="Scheduled maintenance">
            The editor is read-only on Sunday from 02:00 to 03:00 UTC.
          </Banner>
        ),
      },
      dont: {
        caption: "Don't use danger for something that is not an error.",
        antiPattern: 'Using danger tone for non-errors',
        example: (
          <Banner tone="danger" title="Scheduled maintenance">
            The editor is read-only on Sunday from 02:00 to 03:00 UTC.
          </Banner>
        ),
      },
    },
  ],
  textOnly: {
    'Stacking several banners':
      'Shown in words: several banners push content down and compete; merge them or use toasts.',
  },
};

const meta = {
  title: 'Usage/Banner',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
