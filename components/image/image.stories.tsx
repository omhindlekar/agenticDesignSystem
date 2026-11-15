import type { Meta, StoryObj } from '@storybook/react-vite';
import { Image } from './image';
import { primitive } from '../foundations/tokens';

/** A sample picture painted from palette tokens at load, so the story holds no colour literals. */
function paintSample(): string {
  const doc = (globalThis as { document?: Document }).document;
  // Outside a browser (the parity check) there may be no document or canvas to paint on.
  if (!doc) return 'sample.png';
  const canvas = doc.createElement('canvas');
  // Painted at 8x so it stays sharp when scaled up to the frame.
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  if (!ctx) return 'sample.png';
  ctx.scale(8, 8);
  const blocks: Array<[string, number, number, number, number]> = [
    ['color-blue-700', 0, 0, 160, 90],
    ['color-blue-900', 0, 54, 160, 36],
    ['color-lime-300', 104, 14, 22, 22],
    ['color-light-blue-300', 20, 34, 44, 20],
  ];
  for (const [token, x, y, w, h] of blocks) {
    ctx.fillStyle = primitive(token);
    ctx.fillRect(x, y, w, h);
  }
  return canvas.toDataURL('image/png');
}
const sample = paintSample();

const meta = {
  title: 'Components/Image',
  component: Image,
  args: { src: sample, alt: 'Abstract blocks in the brand palette' },
} satisfies Meta<typeof Image>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Square: Story = { args: { ratio: '1:1' }, parameters: { ads: { variant: '1:1' } } };
export const FourByThree: Story = { args: { ratio: '4:3' }, parameters: { ads: { variant: '4:3' } } };
export const Wide: Story = { args: { ratio: '16:9' }, parameters: { ads: { variant: '16:9' } } };
export const Auto: Story = { args: { ratio: 'auto' }, parameters: { ads: { variant: 'auto' } } };
export const Default: Story = { args: { ratio: '16:9' }, parameters: { ads: { state: 'default' } } };
export const Error: Story = { args: { ratio: '16:9', src: '' }, parameters: { ads: { state: 'error' } } };
