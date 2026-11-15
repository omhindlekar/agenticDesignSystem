import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './spinner.meta.json';
import { Spinner } from './spinner';

/** Do and don't examples for the Spinner usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'One spinner for the area that is loading, with a label.',
        example: <Spinner label="Loading projects" />,
      },
      dont: {
        caption: "Don't scatter spinners across the screen.",
        antiPattern: 'Several spinners on one screen at once',
        example: (
          <>
            <Spinner label="Loading" size="sm" />
            <Spinner label="Loading" />
            <Spinner label="Loading" size="lg" />
          </>
        ),
      },
    },
  ],
  textOnly: {
    'A spinner with no label': 'The difference is what a screen reader announces, which a picture cannot show.',
  },
};

const meta = {
  title: 'Usage/Spinner',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
