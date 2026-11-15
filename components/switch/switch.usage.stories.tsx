import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './switch.meta.json';
import { Switch } from './switch';

/** Do and don't examples for the Switch usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Label the setting itself; the switch shows on or off.',
        example: <Switch label="Email alerts" defaultChecked />,
      },
      dont: {
        caption: "Don't label the off state.",
        antiPattern: 'Labels that describe the off state instead of the setting',
        example: <Switch label="Disable email alerts" />,
      },
    },
  ],
  textOnly: {
    'Requiring a Save button after flipping a switch': 'A behaviour over time; a still example would not show it.',
  },
};

const meta = {
  title: 'Usage/Switch',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
