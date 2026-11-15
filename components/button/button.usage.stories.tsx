import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './button.meta.json';
import { Button } from './button';

/** Do and don't examples for the Button usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'One contained button for the main action; others outlined or text.',
        example: (
          <>
            <Button label="Save" />
            <Button label="Preview" variant="outlined" />
            <Button label="Cancel" variant="text" />
          </>
        ),
      },
      dont: {
        caption: "Don't give every action the same weight.",
        antiPattern: 'Using more than one contained primary button in the same view',
        example: (
          <>
            <Button label="Save" />
            <Button label="Preview" />
            <Button label="Cancel" />
          </>
        ),
      },
    },
    {
      do: {
        caption: 'Keep the danger tone for destructive actions.',
        example: <Button label="Delete project" tone="danger" />,
      },
      dont: {
        caption: "Don't use danger to draw attention.",
        antiPattern: 'Using the danger tone for non-destructive actions',
        example: <Button label="Upgrade plan" tone="danger" />,
      },
    },
  ],
  textOnly: {
    'Nesting a button inside another button':
      'Invalid HTML that the browser repairs unpredictably; it cannot be shown safely.',
  },
};

const meta = {
  title: 'Usage/Button',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
