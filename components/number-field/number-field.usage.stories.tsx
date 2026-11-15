import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './number-field.meta.json';
import { NumberField } from './number-field';

/** Do and don't examples for the NumberField usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Use NumberField for quantities.',
        example: <NumberField label="Seats" defaultValue={5} minValue={1} />,
      },
      dont: {
        caption: "Don't use it for numbers that are really identifiers.",
        antiPattern: 'Using it for phone numbers or IDs',
        example: <NumberField label="Phone number" defaultValue={447700900123} />,
      },
    },
  ],
  textOnly: {
    'Removing the step buttons when the value is usually small':
      'NumberField always shows its step buttons, so the mistake cannot be rendered.',
    'A minValue that is not a multiple of step (min 1, step 100 snaps 1200 to 1201)':
      'A behaviour over time; a still example would not show it.',
  },
};

const meta = {
  title: 'Usage/NumberField',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
