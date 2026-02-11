import { io } from 'socket.io-client';

const url = 'http://localhost:4700';
// const url = 'https://xidach-dui.enostd.gay';

const socket = io(url, {
  transports: ['websocket'], // 👈 force WebSocket to avoid fallback polling issues
  timeout: 5000,
  reconnection: true,
  query: {
    token: 'd422c18f-d476-40d1-9114-e4fde45a085a',
  },
});

const roomId = '8999110016646';

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);

  // Tell the server to add this socket to the room
  socket.emit(
    'join-table',
    {
      tableId: roomId,
    },
    (data: any) => {
      console.log('✅ Join room -> join-table:', data);
    }
  );

  socket.emit('glt', {}, (data: any) => {
    console.log('================================================================');
    console.log('✅ [glt] Emit: ', data);
  });

  socket.emit('join-table-card-scanner', {
    tableId: `${roomId}-card-scanner`,
  });
});

socket.on('tbs', (msg) => {
  console.log('================================================================');
  console.log('[🔔 [tbs] Event Message]:', msg);
});

socket.on('glt', (msg) => {
  console.log('================================================================');
  console.log('[🔔 [glt] Event Message]:', msg);
});

socket.on('scan-card', (msg) => {
  console.log('================================================================');
  console.log('[🔔 [scan-card] Event Message]:', msg);
});

socket.on('event-gift-code', (msg) => {
  console.log('================================================================');
  console.log('[🔔 [event-gift-code] Event Message]:', msg);
});

socket.on('disconnect', (reason) => {
  console.log('================================================================');
  console.log('❌ Disconnected:', reason);
});

socket.on('connect_error', (err: any) => {
  console.error('❌ Socket connection failed:', err.message);

  if (err.data?.code === 'TOKEN_EXPIRED') {
    console.warn('🚪 Token expired. Logging out user...');
    // Add logic to log out user or redirect
    socket.disconnect();
  }

  if (err.data?.code === 'UNAUTHORIZED') {
    console.warn('🔐 Unauthorized access. Redirecting...');
    // Handle accordingly
  }
});
