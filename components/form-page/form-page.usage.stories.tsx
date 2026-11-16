import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './form-page.meta.json';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { Stack } from '../stack/stack';

/** Do and don't examples for the FormPage usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Put the submit action after the fields it submits.',
        example: (
          <Stack>
            <Input label="Full name" />
            <Input label="Email address" type="email" />
            <div>
              <Button label="Save changes" variant="contained" />
            </div>
          </Stack>
        ),
      },
      dont: {
        caption: "Don't put actions above the fields.",
        antiPattern: 'Actions above the fields',
        example: (
          <Stack>
            <div>
              <Button label="Save changes" variant="contained" />
            </div>
            <Input label="Full name" />
            <Input label="Email address" type="email" />
          </Stack>
        ),
      },
    },
  ],
  textOnly: {
    'More than six fields with no sections': 'A long run of fields needs a full page to show the problem.',
    'A total people only see after the submit button': 'It only shows at phone width; FormPage puts the summary above the form there.',
  },
};

const meta = {
  title: 'Usage/FormPage',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
