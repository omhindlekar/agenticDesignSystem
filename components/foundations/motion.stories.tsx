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
    </div>
  );
}

export const Motion: StoryObj = { render: () => <MotionDemo /> };
