import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsagePage } from '../../.storybook/usage/usage-page';
import type { UsageSpec } from '../../.storybook/usage/usage-page';
import metadata from './field.meta.json';
import { Field } from './field';

/** Do and don't examples for the Field usage page; everything else comes from the metadata. */
const spec: UsageSpec = {
  pairs: [
    {
      do: {
        caption: 'Spread the control props so the label, helper and error are linked.',
        example: (
          <Field label="Project name" helperText="Shown on the dashboard">
            {(control) => <input {...control} className="ads-input__field" />}
          </Field>
        ),
      },
      dont: {
        caption: "Don't drop the control props; the label and messages are no longer linked.",
        antiPattern: 'Forgetting to spread the control props, which breaks the label and error links',
        example: (
          <Field label="Project name" helperText="Shown on the dashboard">
            {() => <input className="ads-input__field" aria-label="Project name" />}
          </Field>
        ),
      },
    },
  ],
};

const meta = {
  title: 'Usage/Field',
  parameters: { layout: 'padded', usage: spec },
} satisfies Meta;
export default meta;

export const Guidelines: StoryObj = { render: () => <UsagePage meta={metadata} spec={spec} /> };
