import { useState } from 'react';
import { Card, Text, Input, Link, Banner, Button } from '@ads/components';

export default function Screen() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '640px',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-component-gap-md)',
        padding: 'var(--space-layout-page)',
        boxSizing: 'border-box',
      }}
    >
      <Card variant="flat" padding="lg" aria-label="Review and send transfer">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-component-gap-md)',
          }}
        >
          <Text variant="h2" as="div" tone="heading">
            Review and send
          </Text>

          <Text variant="body1" as="p" tone="secondary">
            Check every detail carefully. Transfers cannot be recalled once sent.
          </Text>

          <Banner
            tone="info"
            title="First time paying this recipient"
          >
            You have only paid Sharma Textiles Pvt Ltd once before. Verify the account details are correct before sending.
          </Banner>

          <Card variant="default" padding="lg" aria-label="Transfer summary">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-component-gap-md)',
              }}
            >
              <Text variant="overline" as="span" tone="secondary">
                AMOUNT
              </Text>

              <Text variant="display" as="div" tone="heading">
                INR 8,45,000
              </Text>

              <Card variant="flat" padding="md" aria-label="Recipient — edit">
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-component-gap-sm)',
                  }}
                >
                  <Text variant="caption" as="span" tone="secondary">
                    TO
                  </Text>
                  <Text variant="body1" as="div" tone="primary">
                    Sharma Textiles Pvt Ltd
                  </Text>
                  <Text variant="body2" as="div" tone="secondary">
                    HDFC Bank · Account ending 4821
                  </Text>
                  <Link href="#edit-recipient" variant="standalone">
                    Edit recipient
                  </Link>
                </div>
              </Card>

              <Card variant="flat" padding="md" aria-label="Source account — edit">
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-component-gap-sm)',
                  }}
                >
                  <Text variant="caption" as="span" tone="secondary">
                    FROM
                  </Text>
                  <Text variant="body1" as="div" tone="primary">
                    Northwind Current Account · 9034
                  </Text>
                  <Link href="#edit-source" variant="standalone">
                    Edit account
                  </Link>
                </div>
              </Card>

              <Card variant="flat" padding="md" aria-label="Arrival estimate">
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-component-gap-sm)',
                  }}
                >
                  <Text variant="caption" as="span" tone="secondary">
                    ARRIVES
                  </Text>
                  <Text variant="body1" as="div" tone="primary">
                    Today by 5:00 PM (NEFT)
                  </Text>
                </div>
              </Card>

              <Card variant="flat" padding="md" aria-label="Transfer fee">
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-component-gap-sm)',
                  }}
                >
                  <Text variant="caption" as="span" tone="secondary">
                    FEE
                  </Text>
                  <Text variant="body1" as="div" tone="primary">
                    INR 0
                  </Text>
                  <Text variant="caption" as="div" tone="secondary">
                    No fee applies to this transfer today
                  </Text>
                </div>
              </Card>
            </div>
          </Card>

          <Card variant="default" padding="lg" aria-label="One-time code confirmation">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-component-gap-md)',
              }}
            >
              <Text variant="subtitle" as="div" tone="heading">
                Confirm with one-time code
              </Text>

              <Text variant="body2" as="p" tone="secondary">
                We sent a 6-digit code to your registered mobile number. Enter it below to authorise this transfer.
              </Text>

              <Input
                label="One-time code"
                placeholder="Enter 6-digit code"
                type="tel"
                name="otp"
                required
                helperText="Code expires in 10 minutes"
                value={otp}
                onChange={setOtp}
              />
            </div>
          </Card>

          <Button
            label="Send INR 8,45,000"
            variant="contained"
            tone="primary"
            size="lg"
            type="submit"
            loading={loading}
            onClick={handleSubmit}
          />

          <Button
            label="Go back"
            variant="ghost"
            size="md"
            type="button"
          />
        </div>
      </Card>
    </div>
  );
}
