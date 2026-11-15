import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../button/button';
import { resolved } from './tokens';
import './foundations.css';

const meta = {
  title: 'Foundations/Motion',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

function MotionDemo() {
  const [moved, setMoved] = useState(false);
  return (
    <div className="fd-page">
      <section className="fd-section">
        <h2 className="fd-section__heading">Motion</h2>
        <p className="fd-note">
          State changes take {resolved.get('motion-duration-standard')}; overlays take {resolved.get('motion-duration-overlay')}. Both use{' '}
          {resolved.get('motion-easing-standard')}. With reduced motion turned on, nothing animates.
        </p>
        <div>
          <Button label={moved ? 'Move back' : 'Play'} variant="outlined" onClick={() => setMoved((m) => !m)} />
        </div>
        <div className="fd-motion" data-moved={moved}>
          <span className="fd-overline">Standard · motion-duration-standard</span>
          <div className="fd-motion__track">
            <span className="fd-motion__dot" data-speed="standard" />
          </div>
          <span className="fd-overline">Overlay · motion-duration-overlay</span>
          <div className="fd-motion__track">
            <span className="fd-motion__dot" data-speed="overlay" />
          </div>
        </div>
      </section>
      <EnterExit />
    </div>
  );
}

function EnterExit() {
  const [open, setOpen] = useState(true);
  return (
    <section className="fd-section">
      <h2 className="fd-section__heading">Enter and exit</h2>
      <p className="fd-note">
        Entering uses motion-easing-enter over motion-duration-overlay; leaving uses motion-easing-exit over
        motion-duration-overlay-exit. Exits are shorter, so dismissing feels immediate.
      </p>
      <div>
        <Button label={open ? 'Hide panel' : 'Show panel'} variant="outlined" onClick={() => setOpen((o) => !o)} />
      </div>
      <div className="fd-motion__track">
        <div className="fd-motion__panel" data-open={open}>
          <span className="fd-token__name">Panel</span>
        </div>
      </div>
    </section>
  );
}

export const Motion: StoryObj = { render: () => <MotionDemo /> };
