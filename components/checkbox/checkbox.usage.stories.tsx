import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './checkbox.meta.json';
import { Checkbox } from './checkbox';
import { RadioGroup } from '../radio-group/radio-group';

/** Do and don't examples for the Checkbox usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Use a radio group when only one option may be chosen.',
        example: (
          <RadioGroup
            label="Billing"
            options={[
              { value: 'm', label: 'Monthly' },
              { value: 'y', label: 'Yearly' },
            ]}
            defaultValue="m"
          />
        ),
      },
      dont: {
        caption: "Don't use checkboxes for a single choice.",
        antiPattern: 'Using checkboxes where only one selection is allowed at a time',
        example: (
          <div>
            <Checkbox label="Monthly" defaultChecked />
            <Checkbox label="Yearly" />
          </div>
        ),
      },
    },
  ],
  textOnly: {
    'Omitting a visible label': 'The label prop is required, so the component cannot render without one.',
    'Using Checkbox as a navigation element':
      'Navigation belongs to Link; a checkbox that changes page cannot be shown meaningfully in a frame.',
  },
};

const meta = {
  title: 'Usage/Checkbox',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
