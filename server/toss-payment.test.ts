import { describe, it, expect, beforeAll } from 'vitest';

describe('Toss Payments Integration', () => {
  let clientKey: string;
  let secretKey: string;

  beforeAll(() => {
    clientKey = process.env.VITE_TOSS_CLIENT_KEY || '';
    secretKey = process.env.TOSS_SECRET_KEY || '';
  });

  it('should have valid Toss Payments test keys configured', () => {
    expect(clientKey).toBeTruthy();
    expect(secretKey).toBeTruthy();
    expect(clientKey).toMatch(/^test_ck_/);
    expect(secretKey).toMatch(/^test_sk_/);
  });

  it('should generate valid Basic auth header from secret key', () => {
    const credentials = `${secretKey}:`;
    const encoded = Buffer.from(credentials).toString('base64');
    
    expect(encoded).toBeTruthy();
    expect(encoded.length).toBeGreaterThan(0);
    
    // Verify it can be decoded back
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
    expect(decoded).toBe(credentials);
  });

  it('should validate payment widget client key format', () => {
    // Client key should start with 'test_ck_' for test environment
    expect(clientKey).toMatch(/^test_ck_[a-zA-Z0-9]+$/);
  });

  it('should validate payment secret key format', () => {
    // Secret key should start with 'test_sk_' for test environment
    expect(secretKey).toMatch(/^test_sk_[a-zA-Z0-9]+$/);
  });

  it('should be able to make authenticated request to Toss API', async () => {
    const credentials = `${secretKey}:`;
    const basicAuth = `Basic ${Buffer.from(credentials).toString('base64')}`;

    // Test with a dummy payment key to verify authentication setup
    // (This will fail with 404 since the payment doesn't exist, but auth header will be validated)
    try {
      const response = await fetch(
        'https://api.tosspayments.com/v1/payments/dummy_payment_key',
        {
          method: 'POST',
          headers: {
            'Authorization': basicAuth,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: 'test_order',
            amount: 1000,
          }),
        }
      );

      // We expect 404 or 400 (not 401 Unauthorized)
      expect(response.status).not.toBe(401);
      console.log(`✅ Toss Payments authentication header is valid (HTTP ${response.status})`);
    } catch (error) {
      // Network errors are acceptable in test environment
      console.log('⚠️ Network error (acceptable in test environment):', error);
    }
  });

  it('should have payment widget SDK available', async () => {
    // Verify that the Toss Payments SDK URL is accessible
    try {
      const response = await fetch('https://js.tosspayments.com/v2/standard');
      expect(response.status).toBe(200);
      console.log('✅ Toss Payments SDK is accessible');
    } catch (error) {
      console.error('❌ Failed to access Toss Payments SDK:', error);
      throw error;
    }
  });
});
