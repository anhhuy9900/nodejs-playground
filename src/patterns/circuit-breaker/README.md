# Circuit Breaker Pattern

Ngăn cascade failures bằng cách ngắt kết nối đến failing services.

## States
- **CLOSED**: Normal operation
- **OPEN**: Reject tất cả requests
- **HALF_OPEN**: Test recovery

## Run
\`\`\`bash
npm run dev src/patterns/circuit-breaker/index.ts
\`\`\`

## Use Cases
- External API calls
- Database connections
- Microservices communication
