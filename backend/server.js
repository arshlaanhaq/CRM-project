const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const reportRoutes = require('./routes/reportRoutes');
const customerComplaintRoutes = require('./routes/customerComplaintRoutes');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { socketAuth } = require('./middleware/authMiddleware');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// ✅ Allowed origins
const allowedOrigins = ['http://localhost:3000', 'http://82.25.109.100:3000'];

// ✅ CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// ✅ Log incoming origins for debugging
app.use((req, res, next) => {
  console.log('🌍 Request Origin:', req.headers.origin);
  next();
});

// ✅ Global CORS headers for OPTIONS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

// ✅ Routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/customer-complaints', customerComplaintRoutes);

app.get('/', (req, res) => {
  res.send('CRM API Running...');
});

// ✅ Socket.IO with JWT & CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

global.io = io;

const onlineUsers = new Map();

io.use(socketAuth);

io.on('connection', (socket) => {
  const user = socket.user;

  onlineUsers.set(socket.id, {
    socketId: socket.id,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  const emitOnlineUsers = () => {
    const users = Array.from(onlineUsers.values());
    const technicians = users.filter(u => u.role === 'technician');
    const staff = users.filter(u => u.role === 'staff');

    io.emit('onlineUsers', {
      all: users,
      technicians,
      staff,
    });
  };

  emitOnlineUsers();

  socket.on('disconnect', () => {
    onlineUsers.delete(socket.id);
    emitOnlineUsers();
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
