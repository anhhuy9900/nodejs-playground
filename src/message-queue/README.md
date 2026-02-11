# Message Queue with Bull

Production-ready queue với retry, priority, rate limiting.

## Prerequisites
\`\`\`bash
docker run -d -p 6379:6379 redis
npm install bull ioredis @types/bull
\`\`\`

## Run
\`\`\`bash
npm run dev src/message-queue/index.ts
\`\`\`

## Test
\`\`\`bash
# Send email
curl -X POST http://localhost:3001/email/send -H "Content-Type: application/json" -d '{"to":"user@test.com","subject":"Test","body":"Hello"}'

# Process video
curl -X POST http://localhost:3001/video/process -H "Content-Type: application/json" -d '{"videoId":"vid123","url":"s3://bucket/video.mp4","resolution":"1080p"}'

# Check stats
curl http://localhost:3001/stats/email
\`\`\`
