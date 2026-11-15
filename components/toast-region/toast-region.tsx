import {
  Button,
  Text,
  UNSTABLE_Toast as RacToast,
  UNSTABLE_ToastContent as RacToastContent,
  UNSTABLE_ToastQueue as RacToastQueue,
  UNSTABLE_ToastRegion as RacToastRegion,
} from 'react-aria-components';
import { Icon } from '../icon/icon';
import type { IconName } from '../icon/icon';
import '../shared/shared.css';
import '../icon-button/icon-button.css';
import '../button/button.css';
import './toast-region.css';

export interface ToastContent {
  title: string;
  description?: string;
  tone?: 'info' | 'success' | 'warning' | 'danger';
  action?: { label: string; onAction: () => void };
}

/** Default time a toast without an action stays visible. Paused while hovered or focused. */
export const TOAST_TIMEOUT = 6000;

/**
 * The app's toast queue. Our wrapper around React Aria's (UNSTABLE_) toast API, so the
 * rest of the system depends on toast() and ToastRegion only.
 */
export const toastQueue = new RacToastQueue<ToastContent>({ maxVisibleToasts: 3 });

/**
 * Shows a toast. Toasts with an action never time out (WCAG 2.2.1); others close after
 * TOAST_TIMEOUT unless a timeout is given. Returns a key for closing it early.
 */
export function toast(content: ToastContent, options: { timeout?: number } = {}): string {
  const timeout = content.action ? undefined : (options.timeout ?? TOAST_TIMEOUT);
  return toastQueue.add(content, timeout !== undefined ? { timeout } : {});
}

const ICONS: Record<NonNullable<ToastContent['tone']>, IconName> = {
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  danger: 'report',
};

export interface ToastRegionProps {
  placement?: 'bottom-end' | 'top-end';
}

/** Renders the queue. Place it once at the root of the app; F6 moves focus to it. */
export function ToastRegion({ placement = 'bottom-end' }: ToastRegionProps) {
  return (
    // A stable root (display: contents) that exists even when no toasts are showing.
    <div className="ads-toast-root" data-variant={placement} data-state="default">
      <RacToastRegion queue={toastQueue} className="ads-toast-region" data-variant={placement}>
        {({ toast: item }) => {
          const tone = item.content.tone ?? 'info';
          return (
            <RacToast toast={item} className="ads-toast" data-tone={tone}>
              <span className="ads-toast__icon">
                <Icon name={ICONS[tone]} />
              </span>
              <RacToastContent className="ads-toast__content">
                <Text slot="title" className="ads-toast__title">
                  {item.content.title}
                </Text>
                {item.content.description ? (
                  <Text slot="description" className="ads-toast__description">
                    {item.content.description}
                  </Text>
                ) : null}
              </RacToastContent>
              {item.content.action ? (
                <Button
                  className="ads-button ads-state-layer ads-toast__action"
                  data-variant="text"
                  data-tone="primary"
                  data-size="sm"
                  data-state="default"
                  onPress={() => {
                    item.content.action?.onAction();
                    toastQueue.close(item.key);
                  }}
                >
                  <span className="ads-button__label">{item.content.action.label}</span>
                </Button>
              ) : null}
              <Button
                slot="close"
                className="ads-icon-button ads-state-layer ads-toast__close"
                data-variant="standard"
                data-tone="primary"
                data-size="sm"
                data-state="default"
                aria-label="Close"
              >
                <Icon name="close" />
              </Button>
            </RacToast>
          );
        }}
      </RacToastRegion>
    </div>
  );
}
