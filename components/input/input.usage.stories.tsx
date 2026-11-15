import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './input.meta.json';
import { Input } from './input';

/** Do and don't examples for the Input usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Give every field a visible label; use the placeholder for an example.',
        example: <Input label="Email" placeholder="name@example.com" type="email" />,
      },
      dont: {
        caption: "Don't use the placeholder as the label; it disappears when people type.",
        antiPattern: 'Using placeholder text as the only label',
        example: <input className="ads-input__field" placeholder="Email" aria-label="Email" />,
      },
    },
  ],
  textOnly: {
    'Omitting a visible label — always provide a label element, not just a placeholder':
      'Covered by the example above; the label prop is required.',
    'Nesting an Input inside another Input': 'Invalid markup that cannot be rendered meaningfully.',
  },
};

const meta = {
  title: 'Usage/Input',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
