import axios from 'axios';
import { CircuitBreaker } from './CircuitBreaker';

const apiCircuit = new CircuitBreaker({
  failureThreshold: 3,
  successThreshold: 2,
  timeout: 5000,
  resetTimeout: 30000,
});

async function callExternalAPI(userId: string) {
  return apiCircuit.execute(
    async () => {
      const response = await axios.get(`https://jsonplaceholder.typicode.com/users/${userId}`);
      return response.data;
    },
    () => ({ id: userId, name: 'Cached User', cached: true })
  );
}

(async () => {
  console.log('🔄 Testing Circuit Breaker Pattern\n');

  for (let i = 0; i < 10; i++) {
    try {
      const user = await callExternalAPI('1');
      console.log(`✅ Attempt ${i + 1}:`, user.name, apiCircuit.getStats());
    } catch (error: any) {
      console.error(`❌ Attempt ${i + 1}:`, error.message, apiCircuit.getStats());
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
})();
