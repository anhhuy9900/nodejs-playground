import CircuitBreaker from 'opossum';
import express from 'express';

/**
 * Opossum Circuit Breaker Flow:
 *
 * 1. CLOSED State (Normal Operation):
 *    - All requests pass through to callPaymentsAPI
 *    - Monitors success/failure rate
 *
 * 2. OPEN State (Circuit Trips):
 *    - Triggered when errorThresholdPercentage (50%) is exceeded
 *    - Requires volumeThreshold (20 requests) to calculate percentage
 *    - All requests immediately fail without calling the API
 *    - Waits for resetTimeout (10 seconds) before attempting recovery
 *
 * 3. HALF_OPEN State (Testing Recovery):
 *    - After resetTimeout expires, allows one test request
 *    - If successful: circuit closes and normal operation resumes
 *    - If failed: circuit reopens for another resetTimeout period
 */

// Simulated payment API call
async function callPaymentsAPI(data: any): Promise<any> {
  // Simulate random failures (30% chance)
  if (Math.random() < 0.3) {
    throw new Error('Payment service unavailable');
  }

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    transactionId: Math.random().toString(36).substring(7),
    amount: data.amount || 100,
    status: 'success',
  };
}

const wrapped = new CircuitBreaker(callPaymentsAPI, {
  timeout: 1200,
  errorThresholdPercentage: 50,
  volumeThreshold: 20,
  resetTimeout: 10_000,
});

// Monitor circuit breaker events
wrapped.on('open', () => console.log('Circuit breaker opened'));
wrapped.on('halfOpen', () => console.log('Circuit breaker half-open'));
wrapped.on('close', () => console.log('Circuit breaker closed'));
wrapped.on('failure', (error) => console.log('Request failed:', error.message));

const app = express();

app.get('/charge', async (req, res) => {
  try {
    const r = await wrapped.fire(req.query);
    res.json(r);
  } catch {
    res.setHeader('Retry-After', '5');
    res.status(503).json({ ok: false, reason: 'payments unavailable' });
  }
});

app.get('/stats', (req, res) => {
  res.json(wrapped.stats);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Circuit Breaker example running on port ${PORT}`);
  console.log(`Try: http://localhost:${PORT}/charge?amount=100`);
});
