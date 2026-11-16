import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './auth-page.meta.json';
import { Banner } from '../banner/banner';
import { Button } from '../button/button';
import { Stack } from '../stack/stack';

/** Do and don't examples for the AuthPage usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'One primary action; other ways in are outlined, after “or”.',
        example: (
          <Stack gap="sm">
            <Button label="Sign in" variant="contained" />
            <Button label="Sign in with single sign-on" variant="outlined" />
          </Stack>
        ),
      },
      dont: {
        caption: "Don't make every way in look primary.",
        antiPattern: 'More than one primary action',
        example: (
          <Stack gap="sm">
            <Button label="Sign in" variant="contained" />
            <Button label="Sign in with single sign-on" variant="contained" />
          </Stack>
        ),
      },
    },
    {
      do: {
        caption: 'Say that the details don’t match, without saying which.',
        example: (
          <Banner tone="danger" title="We couldn’t sign you in">
            The email address or password is incorrect. Check both and try again.
          </Banner>
        ),
      },
      dont: {
        caption: "Don't confirm whether an account exists.",
        antiPattern: 'Error messages that reveal whether an account exists',
        example: (
          <Banner tone="danger" title="No account found">
            There is no account for this email address.
          </Banner>
        ),
      },
    },
  ],
  textOnly: {
    'Hiding account recovery behind a menu': 'The fault is an absence: there is nothing useful to show.',
  },
};

const meta = {
  title: 'Usage/AuthPage',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
