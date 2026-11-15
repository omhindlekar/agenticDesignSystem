import { useState } from 'react';
import '../shared/shared.css';
import './avatar.css';

export interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
}

const TONES = ['primary', 'info', 'success', 'warning', 'neutral'] as const;

/** Same name, same colour: a small stable hash of the name picks a tonal role. */
function toneFor(name: string): (typeof TONES)[number] {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length]!;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '')).toUpperCase();
}

/** A person's photo, or their initials on a tonal square when there is no photo. */
export function Avatar({ name, src, size = 'md' }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const tone = toneFor(name);
  if (src && !failed) {
    return <img className="ads-avatar" data-variant={size} data-tone={tone} data-state="default" src={src} alt={name} onError={() => setFailed(true)} />;
  }
  return (
    <span className="ads-avatar" data-variant={size} data-tone={tone} data-state="default" role="img" aria-label={name}>
      <span aria-hidden="true">{initials(name)}</span>
    </span>
  );
}
