# Dynamic Worker Pool

Auto-scaling worker pool với dynamic worker creation/termination.

## Features
- Auto-scale workers theo queue size
- Task timeout handling
- Idle worker cleanup
- Real-time metrics

## Run
\`\`\`bash
npm run dev src/threads/worker-pool-advanced/index.ts
\`\`\`

## Test
\`\`\`bash
curl -X POST http://localhost:3000/compute -H "Content-Type: application/json" -d '{"numbers":[1,2,3,4,5]}'
curl http://localhost:3000/stats
\`\`\`
