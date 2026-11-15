import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './modal.meta.json';
import { Modal } from './modal';
import { Button } from '../button/button';

function ConfirmDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button label="Delete project" tone="danger" variant="outlined" onClick={() => setOpen(true)} />
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Delete project?"
        variant="danger"
        footer={
          <>
            <Button label="Cancel" variant="text" onClick={() => setOpen(false)} />
            <Button label="Delete" tone="danger" onClick={() => setOpen(false)} />
          </>
        }
      >
        This removes the project and its history.
      </Modal>
    </>
  );
}

/** Do and don't examples for the Modal usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: { caption: 'Confirm destructive actions in a titled modal with a way out.', example: <ConfirmDemo /> },
      dont: {
        caption: "Don't block people with no way to dismiss; Modal always keeps Close and Escape.",
        antiPattern: 'Blocking the user without offering a way to dismiss',
        example: <Button label="Accept to continue (no way back)" variant="outlined" />,
      },
    },
  ],
  textOnly: {
    'Opening a modal from inside another modal — stack modals never more than one deep':
      'Stacked modals trap focus twice; shown in words to keep the page usable.',
    'Omitting a title — every modal needs a visible heading for screen readers':
      'The title prop is required, so the component cannot render without one.',
  },
};

const meta = {
  title: 'Usage/Modal',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
