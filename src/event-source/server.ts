import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';

const app = express();
app.use(cors());

// Endpoint for SSE stream
app.get('/api/updates', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send initial SSE event
  res.write(`data: ${JSON.stringify({ message: 'Connected to SSE stream' })}\n\n`);

  // Send periodic SSE events (for demonstration purposes)
  const interval = setInterval(() => {
    const eventData = { timestamp: new Date().toISOString() + uuidv4() };
    res.write(`data: ${JSON.stringify(eventData)}\n\n`);
  }, 6000);

  // Clean up SSE connection on client disconnect
  req.on('close', () => {
    clearInterval(interval);
  });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
