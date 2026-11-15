import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './textarea.meta.json';
import { Textarea } from './textarea';

/** Do and don't examples for the Textarea usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Put instructions in the helper text, where they stay visible.',
        example: <Textarea label="Description" helperText="What the project is for, in a sentence or two" />,
      },
      dont: {
        caption: "Don't rely on placeholder text for instructions.",
        antiPattern: 'Using a placeholder as the only instruction',
        example: <Textarea label="Description" placeholder="What the project is for, in a sentence or two" />,
      },
    },
  ],
  textOnly: {
    'Setting a tiny maxLength without showing the count': 'A behaviour over time; a still example would not show it.',
  },
};

const meta = {
  title: 'Usage/Textarea',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
