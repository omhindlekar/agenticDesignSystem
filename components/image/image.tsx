import { useState } from 'react';
import { Icon } from '../icon/icon';
import '../shared/shared.css';
import './image.css';

export interface ImageProps {
  src: string;
  alt: string;
  ratio?: '1:1' | '4:3' | '16:9' | 'auto';
  fit?: 'cover' | 'contain';
}

/**
 * An image in a fixed aspect ratio. alt is required: describe the image, or pass an empty
 * string when it is decorative. If it fails to load, a tile keeps the alt text.
 */
export function Image({ src, alt, ratio = 'auto', fit = 'cover' }: ImageProps) {
  const [loadFailed, setLoadFailed] = useState(false);
  // An empty src shows the fallback straight away.
  const failed = loadFailed || src === '';
  return (
    <span className="ads-image" data-variant={ratio} data-fit={fit} data-state={failed ? 'error' : 'default'}>
      {failed ? (
        <span className="ads-image__fallback" {...(alt ? { role: 'img', 'aria-label': alt } : { 'aria-hidden': true })}>
          <Icon name="report" size="lg" />
        </span>
      ) : (
        <img className="ads-image__img" src={src} alt={alt} onError={() => setLoadFailed(true)} />
      )}
    </span>
  );
}
