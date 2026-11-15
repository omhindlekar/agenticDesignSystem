import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './toast-region.meta.json';
import { ToastRegion, toast } from './toast-region';
import { Button } from '../button/button';

/** Do and don't examples for the ToastRegion usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Use toasts for brief confirmations; keep one ToastRegion in the app.',
        example: (
          <>
            <Button
              label="Copy link"
              variant="outlined"
              onClick={() => toast({ title: 'Link copied', tone: 'success' })}
            />
            <ToastRegion />
          </>
        ),
      },
      dont: {
        caption: "Don't put essential information in a toast; use a Banner.",
        antiPattern: 'Essential information that disappears before it can be read',
        example: (
          <Button
            label="Show the new password in a toast"
            variant="outlined"
            onClick={() => toast({ title: 'Your new password is K7#p-29x', tone: 'info' })}
          />
        ),
      },
    },
  ],
  textOnly: {
    'More than one ToastRegion in an app': 'An app-structure mistake; one region is already on this page.',
  },
};

const meta = {
  title: 'Usage/ToastRegion',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
