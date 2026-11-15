import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './radio-group.meta.json';
import { RadioGroup } from './radio-group';
import { Checkbox } from '../checkbox/checkbox';

/** Do and don't examples for the RadioGroup usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Preselect a sensible default when an answer is required.',
        example: (
          <RadioGroup
            label="Billing"
            required
            options={[
              { value: 'm', label: 'Monthly' },
              { value: 'y', label: 'Yearly' },
            ]}
            defaultValue="m"
          />
        ),
      },
      dont: {
        caption: "Don't leave a required choice empty when a default is sensible.",
        antiPattern: 'Leaving no option selected when one is required and has a sensible default',
        example: (
          <RadioGroup
            label="Billing"
            required
            options={[
              { value: 'm', label: 'Monthly' },
              { value: 'y', label: 'Yearly' },
            ]}
          />
        ),
      },
    },
    {
      do: { caption: 'Use a checkbox for a single yes or no.', example: <Checkbox label="Send me product news" /> },
      dont: {
        caption: "Don't use a lone radio; it cannot be turned off.",
        antiPattern: 'A single radio on its own',
        example: <RadioGroup label="Newsletter" options={[{ value: 'y', label: 'Send me product news' }]} />,
      },
    },
  ],
};

const meta = {
  title: 'Usage/RadioGroup',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
