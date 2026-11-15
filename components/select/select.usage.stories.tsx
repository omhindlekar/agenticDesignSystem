import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './select.meta.json';
import { Select } from './select';
import { SegmentedControl } from '../segmented-control/segmented-control';

/** Do and don't examples for the Select usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Show two or three options at once.',
        example: (
          <SegmentedControl
            label="Plan"
            options={[
              { value: 'f', label: 'Free' },
              { value: 'p', label: 'Pro' },
            ]}
            defaultValue={['f']}
          />
        ),
      },
      dont: {
        caption: "Don't hide two options behind a dropdown.",
        antiPattern: 'Using Select when only two or three options exist',
        example: (
          <Select
            label="Plan"
            options={[
              { value: 'f', label: 'Free' },
              { value: 'p', label: 'Pro' },
            ]}
          />
        ),
      },
    },
  ],
  textOnly: {
    'Omitting a label — always provide a visible label':
      'The label prop is required, so the component cannot render without one.',
    'Using Select for navigation menus': 'Navigation uses Link, Tabs or SideNav (DS-C-008); shown in words.',
  },
};

const meta = {
  title: 'Usage/Select',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
