import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './popover.meta.json';
import { Popover } from './popover';
import { Button } from '../button/button';
import { Switch } from '../switch/switch';

/** Do and don't examples for the Popover usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Keep popovers small: a setting or two.',
        example: (
          <Popover title="Share project" trigger={<Button label="Share" variant="outlined" />}>
            <Switch label="Allow comments" />
          </Popover>
        ),
      },
      dont: {
        caption: "Don't put a whole form in a popover; use a Drawer or a page.",
        antiPattern: 'Putting a whole form with many fields in a popover',
        example: (
          <Popover title="Edit profile" trigger={<Button label="Edit profile (12 fields)" variant="outlined" />}>
            <Switch label="Field 1 of 12" />
          </Popover>
        ),
      },
    },
  ],
  textOnly: {
    'Nesting popovers': 'Stacked popovers fight over focus and Escape; shown in words to keep the page usable.',
  },
};

const meta = {
  title: 'Usage/Popover',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
