import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './combobox.meta.json';
import { Combobox } from './combobox';

const sizes = [
  { value: 's', label: 'Small' },
  { value: 'm', label: 'Medium' },
  { value: 'l', label: 'Large' },
];
const countries = [
  'Argentina',
  'Australia',
  'Brazil',
  'Canada',
  'Denmark',
  'France',
  'Germany',
  'India',
  'Ireland',
  'Japan',
  'Kenya',
  'Mexico',
  'Norway',
  'Spain',
  'Sweden',
  'United Kingdom',
  'United States',
].map((c) => ({ value: c, label: c }));

/** Do and don't examples for the Combobox usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Use a combobox for long lists people search.',
        example: <Combobox label="Country" options={countries} placeholder="Type to search" />,
      },
      dont: {
        caption: "Don't make people type to choose from three options.",
        antiPattern: 'Using it for fewer than about fifteen options',
        example: <Combobox label="Size" options={sizes} />,
      },
    },
  ],
  textOnly: {
    'Filtering on every keystroke against a slow server without debouncing':
      'A behaviour over time; a still example would not show it.',
  },
};

const meta = {
  title: 'Usage/Combobox',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
