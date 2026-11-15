import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './drawer.meta.json';
import { Drawer } from './drawer';
import { Button } from '../button/button';
import { Checkbox } from '../checkbox/checkbox';

function FiltersDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button label="Filters" variant="outlined" onClick={() => setOpen(true)} />
      <Drawer
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Filters"
        footer={<Button label="Apply" onClick={() => setOpen(false)} />}
      >
        <Checkbox label="Only my projects" />
      </Drawer>
    </>
  );
}

/** Do and don't examples for the Drawer usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: { caption: 'Use a drawer for a short, self-contained side task such as filters.', example: <FiltersDemo /> },
      dont: {
        caption: "Don't run a long multi-step flow in a drawer; give it a page.",
        antiPattern: 'Long multi-step flows in a drawer',
        example: <Button label="Start onboarding (step 1 of 6)" variant="outlined" />,
      },
    },
  ],
  textOnly: {
    'Opening a drawer from a drawer': 'Stacked overlays trap focus twice; shown in words to keep the page usable.',
  },
};

const meta = {
  title: 'Usage/Drawer',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
