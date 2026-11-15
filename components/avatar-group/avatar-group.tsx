import { Avatar } from '../avatar/avatar';
import '../avatar/avatar.css';
import './avatar-group.css';

export interface AvatarGroupProps {
  label: string;
  people: Array<{ name: string; src?: string }>;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

/** Overlapping avatars for a group of people, with a "+n" for the rest. */
export function AvatarGroup({ label, people, max = 4, size = 'md' }: AvatarGroupProps) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <div className="ads-avatar-group" data-variant={size} data-state="default" role="group" aria-label={label}>
      {shown.map((p) => (
        <Avatar key={p.name} name={p.name} size={size} {...(p.src ? { src: p.src } : {})} />
      ))}
      {rest > 0 ? (
        <span className="ads-avatar ads-avatar-group__more" data-variant={size} role="img" aria-label={`${rest} more`}>
          <span aria-hidden="true">+{rest}</span>
        </span>
      ) : null}
    </div>
  );
}
