/**
 * Northwind Business: the confirmation shown right after a large payment. An example built
 * only from Agentic DS components and tokens; layout comes from PageShell, Container and Stack.
 *
 * UX decisions:
 * - Certainty, not celebration: a plain status line, then the facts. No exclamation marks.
 * - Order of importance: it worked; how much, to whom and when it arrives; next steps; the
 *   reference number; the cancel note last.
 * - Arrival is a specific time, not "soon". The amount uses Indian digit grouping.
 * - One primary action, Download receipt: an anxious person wants proof first.
 * - Cancelling is never one click: it asks for confirmation in a modal, then the screen
 *   changes to say plainly that the money stayed in the account.
 */
import { useState } from 'react';
import {
  AppHeader,
  Banner,
  Button,
  Card,
  Container,
  Divider,
  Heading,
  Icon,
  IconButton,
  Modal,
  PageShell,
  Stack,
  Text,
  ToastRegion,
  toast,
} from '../../components/index';
import './payment-sent.css';

export const PAYMENT = {
  amount: '₹8,45,000.00',
  payee: 'Sharma Textiles Pvt Ltd',
  payeeAccount: 'HDFC Bank, account ending 4821',
  from: 'Northwind current account ending 0193',
  method: 'NEFT',
  sentAt: '16 November 2026 at 11:42 am',
  arrivesBy: 'By 2:00 pm today',
  cancelUntil: '12:12 pm',
  reference: 'NWB261116428821',
};

/** Groups the reference (prefix, then digits in fours) so it can be read aloud and checked by eye. */
const grouped = (ref: string) => ref.replace(/^([A-Z]+)(\d+)$/, (_, prefix: string, digits: string) => `${prefix} ${digits.replace(/(\d{4})(?=\d)/g, '$1 ')}`);

function Row({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="nw-pay__row">
      <dt>
        <Text variant="body2" as="span" tone="secondary">
          {term}
        </Text>
      </dt>
      <dd>{children}</dd>
    </div>
  );
}

export interface PaymentSentScreenProps {
  /** Start in the cancelled state (for review). */
  cancelled?: boolean;
  /** Start with the cancel confirmation open (for review). */
  confirmingCancel?: boolean;
  /** The 30-minute cancel window has passed. */
  cancelWindowClosed?: boolean;
}

export function PaymentSentScreen({ cancelled = false, confirmingCancel = false, cancelWindowClosed = false }: PaymentSentScreenProps) {
  const [isCancelled, setCancelled] = useState(cancelled);
  const [confirming, setConfirming] = useState(confirmingCancel);
  const p = PAYMENT;

  const copyReference = () => {
    void navigator.clipboard?.writeText(p.reference).catch(() => undefined);
    toast({ title: 'Reference number copied', description: grouped(p.reference), tone: 'success' });
  };

  return (
    <PageShell
      header={
        <AppHeader
          title="Northwind Business"
          nav={[
            { label: 'Dashboard', href: '#dashboard' },
            { label: 'Payments', href: '#payments', current: true },
            { label: 'Statements', href: '#statements' },
          ]}
        />
      }
      background="sunken"
    >
      <Container size="md">
        <Stack gap="section">
          {/* 1. It worked, or, after cancelling, that it didn't happen. */}
          <Stack gap="sm">
            <Stack direction="horizontal" gap="md" align="center">
              <span className="nw-pay__mark" data-tone={isCancelled ? 'neutral' : 'success'}>
                <Icon name={isCancelled ? 'info' : 'check'} size="lg" />
              </span>
              <Heading level={1} appearance="h2">
                {isCancelled ? 'Payment cancelled' : 'Payment sent'}
              </Heading>
            </Stack>
            <Stack gap="sm">
              <Text variant="body1" tone="secondary">
                {isCancelled
                  ? `${p.amount} stays in your current account. ${p.payee} won’t receive it.`
                  : `${p.amount} is on its way to ${p.payee}. It will arrive ${p.arrivesBy.toLowerCase()}.`}
              </Text>
            </Stack>
          </Stack>

          {/* 2. How much, to whom, when; 4. the reference number. */}
          <Card padding="lg">
            <Stack gap="lg">
              <Stack gap="xs">
                <Text variant="overline" tone="secondary">
                  Amount
                </Text>
                <Text variant="h1" as="p" tone="heading">
                  {p.amount}
                </Text>
              </Stack>
              <dl className="nw-pay__details">
                <Row term="To">
                  <Stack gap="xs" align="end">
                    <Text variant="subtitle" as="span">
                      {p.payee}
                    </Text>
                    <Text variant="body2" as="span" tone="secondary">
                      {p.payeeAccount}
                    </Text>
                  </Stack>
                </Row>
                <Row term="From">
                  <Text variant="body2" as="span">
                    {p.from}
                  </Text>
                </Row>
                <Row term={isCancelled ? 'Status' : 'Arrives'}>
                  <Text variant="subtitle" as="span">
                    {isCancelled ? 'Cancelled, not sent' : `${p.arrivesBy}, by ${p.method}`}
                  </Text>
                </Row>
                <Row term={isCancelled ? 'Requested' : 'Sent'}>
                  <Text variant="body2" as="span">
                    {p.sentAt}
                  </Text>
                </Row>
                <Row term="Reference number">
                  <span className="nw-pay__reference">
                    <Text variant="subtitle" as="span">
                      {grouped(p.reference)}
                    </Text>
                    <IconButton icon="content_copy" label="Copy reference number" size="sm" onClick={copyReference} />
                  </span>
                </Row>
              </dl>
            </Stack>
          </Card>

          {/* 3. What next: one primary action. */}
          <Stack direction="horizontal" gap="sm" wrap>
            {!isCancelled && (
              <>
                <Button
                  label="Download receipt"
                  variant="contained"
                  iconStart={<Icon name="download" size="sm" />}
                  onClick={() => toast({ title: 'Receipt downloaded', description: `Payment ${grouped(p.reference)}, PDF`, tone: 'success' })}
                />
                <Button
                  label="Share receipt"
                  variant="outlined"
                  onClick={() => toast({ title: 'Receipt link copied', description: 'Anyone with the link can view this receipt for 7 days.' })}
                />
              </>
            )}
            <Button label="Make another payment" variant={isCancelled ? 'contained' : 'outlined'} />
            <Button label="Back to dashboard" variant="text" />
          </Stack>

          {/* 5. The cancel note, last and calm. */}
          {!isCancelled && (
            <>
              <Divider />
              {cancelWindowClosed ? (
                <Banner tone="info" title="This payment can no longer be cancelled">
                  The 30-minute window has passed. If something is wrong, contact us and quote the reference number.
                </Banner>
              ) : (
                <Banner
                  tone="info"
                  title="Need to cancel? You have 30 minutes"
                  actions={<Button label="Cancel payment" variant="outlined" size="sm" onClick={() => setConfirming(true)} />}
                >
                  You can cancel this payment until {p.cancelUntil} today. The money will stay in your account.
                </Banner>
              )}
            </>
          )}
        </Stack>
      </Container>

      <Modal
        isOpen={confirming}
        onClose={() => setConfirming(false)}
        title="Cancel this payment?"
        variant="danger"
        size="sm"
        footer={
          <>
            <Button label="Keep payment" variant="text" onClick={() => setConfirming(false)} />
            <Button
              label="Cancel payment"
              variant="contained"
              tone="danger"
              onClick={() => {
                setConfirming(false);
                setCancelled(true);
              }}
            />
          </>
        }
      >
        <Text variant="body1">
          {p.amount} won’t be sent to {p.payee}. It stays in your current account.
        </Text>
      </Modal>
      <ToastRegion />
    </PageShell>
  );
}
