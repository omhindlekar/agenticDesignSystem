import type { Meta, StoryObj } from '@storybook/react-vite';
import { FormPage } from './form-page';
import { Button } from '../button/button';
import { Card } from '../card/card';
import { Divider } from '../divider/divider';
import { Grid } from '../grid/grid';
import { Input } from '../input/input';
import { Link } from '../link/link';
import { Section } from '../section/section';
import { Select } from '../select/select';
import { Stack } from '../stack/stack';
import { Text } from '../text/text';

const row = (label: string, value: string, strong = false) => (
  <Stack direction="horizontal" justify="between">
    <Text variant={strong ? 'subtitle' : 'body2'}>{label}</Text>
    <Text variant={strong ? 'subtitle' : 'body2'}>{value}</Text>
  </Stack>
);
const sections = (
  <>
    <Section title="Shipping address" variant="surface">
      <Input label="Full name" name="name" required />
      <Input label="Address line 1" name="address1" required />
      <Grid columns={2} minItemWidth="sm">
        <Input label="Town or city" name="city" required />
        <Input label="Postcode" name="postcode" required />
      </Grid>
      <Select
        label="Country"
        required
        placeholder="Select a country"
        options={[
          { value: 'gb', label: 'United Kingdom' },
          { value: 'ie', label: 'Ireland' },
          { value: 'us', label: 'United States' },
        ]}
      />
    </Section>
    <Section title="Payment" variant="surface" description="Your card is charged when your order ships.">
      <Input label="Card number" name="card" required helperText="The 16 digits on the front of your card." />
      <Grid columns={2} minItemWidth="sm">
        <Input label="Expiry date" name="expiry" required helperText="For example, 04/28" />
        <Input label="Security code" name="cvc" required helperText="The last 3 digits on the back." />
      </Grid>
    </Section>
  </>
);
const summary = (
  <aside aria-label="Order summary">
    <Card title="Order summary" padding="lg">
      <Stack gap="sm">
        {row('Desk lamp × 1', '£48.00')}
        {row('Notebook × 3', '£18.00')}
        {row('Delivery', '£4.99')}
        <Divider />
        {row('Total', '£70.99', true)}
      </Stack>
    </Card>
  </aside>
);

const meta = {
  title: 'Templates/FormPage',
  component: FormPage,
  parameters: { layout: 'fullscreen' },
  args: {
    title: 'Checkout',
    description: 'Check your details, then place your order.',
    backLink: <Link href="#basket">Back to basket</Link>,
    children: sections,
    summary,
    actions: <Button label="Place order" variant="contained" type="submit" size="lg" />,
  },
} satisfies Meta<typeof FormPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const WithSummary: Story = { args: { variant: 'with-summary' }, parameters: { ads: { variant: 'with-summary' } } };
export const SingleColumn: Story = {
  args: {
    variant: 'single-column',
    title: 'Edit profile',
    description: 'This is how other people in your business see you.',
    backLink: <Link href="#settings">Back to settings</Link>,
    children: (
      <Section title="Profile" variant="surface">
        <Input label="Full name" defaultValue="Alex Morgan" />
        <Input label="Job title" defaultValue="Finance lead" />
      </Section>
    ),
    actions: (
      <>
        <Button label="Cancel" variant="text" />
        <Button label="Save changes" variant="contained" type="submit" />
      </>
    ),
  },
  parameters: { ads: { variant: 'single-column' } },
};
export const Default: Story = { parameters: { ads: { state: 'default' } } };
