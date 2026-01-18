# Graceful Shutdown

Safely shutdown server với zero downtime.

## Features
- Health check endpoints (`/health`, `/ready`)
- Active request tracking
- Graceful connection draining
- Configurable timeout

## Run
\`\`\`bash
npm run dev src/server-architecture/graceful-shutdown/index.ts
\`\`\`

## Test
\`\`\`bash
# Start long request
curl http://localhost:3004/api/data &

# Send SIGTERM
kill -SIGTERM <PID>
\`\`\`
