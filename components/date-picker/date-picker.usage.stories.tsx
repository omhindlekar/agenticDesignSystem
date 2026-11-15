import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './date-picker.meta.json';
import { DatePicker } from './date-picker';
import { Input } from '../input/input';

/** Do and don't examples for the DatePicker usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Use DatePicker: typed segments and a calendar.',
        example: <DatePicker label="Start date" defaultValue="2026-11-16" />,
      },
      dont: {
        caption: "Don't ask people to type a date into a text field in a given format.",
        antiPattern: 'Using a text input with a format hint instead',
        example: <Input label="Start date" placeholder="DD/MM/YYYY" helperText="Use the format DD/MM/YYYY" />,
      },
    },
  ],
  textOnly: {
    'Hiding the typed segments so keyboard users must use the calendar':
      'The component always shows the segments, so the mistake cannot be rendered.',
  },
};

const meta = {
  title: 'Usage/DatePicker',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
