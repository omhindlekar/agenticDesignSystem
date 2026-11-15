import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './link.meta.json';
import { Link } from './link';
import { Text } from '../text/text';
import { Button } from '../button/button';

/** Do and don't examples for the Link usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Say where the link goes.',
        example: (
          <Text>
            Version 2 renames tokens. <Link href="#">Read the release notes</Link>.
          </Text>
        ),
      },
      dont: {
        caption: "Don't use link text that makes no sense on its own.",
        antiPattern: "Link text such as 'click here' that does not say where it goes",
        example: (
          <Text>
            Version 2 renames tokens. To read the release notes, <Link href="#">click here</Link>.
          </Text>
        ),
      },
    },
    {
      do: {
        caption: 'Use Button for actions and Link for navigation.',
        example: (
          <>
            <Button label="Save" />
            <Link href="#" variant="standalone">
              View history
            </Link>
          </>
        ),
      },
      dont: {
        caption: "Don't dress a link up as a button.",
        antiPattern: 'Styling a link as a button',
        example: (
          <a href="#" className="ads-button" data-variant="contained" data-size="md">
            View history
          </a>
        ),
      },
    },
  ],
};

const meta = {
  title: 'Usage/Link',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
