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
const socketAuth = require('./middleware/authMiddleware'); 

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// ✅ CORS
app.use(cors({
  origin: ['http://localhost:3000', 'https://crm-project-frontend-hazel.vercel.app'],         // specific domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true              // allow cookies/auth headers
}));
app.use(express.json());

// ✅ API Routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/customer-complaints', customerComplaintRoutes);

app.get('/', (req, res) => {
  res.send('CRM API Running...');
});

//  Setup Socket.IO with JWT auth
const io = new Server(server, {
  cors: {
    origin:  ['http://localhost:3000', 'https://crm-project-frontend-hazel.vercel.app'],
    methods: ['GET', 'POST'],
  },
});

global.io = io; // optional global use

const onlineUsers = new Map();

io.use(socketAuth); //  JWT middleware

io.on('connection', (socket) => {
  const user = socket.user; // attached from middleware
  console.log('⚡ User connected:', user.name);

  //  Add user to online list
  onlineUsers.set(socket.id, {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  //  Broadcast updated online users
  io.emit('onlineUsers', Array.from(onlineUsers.values()));

  //  Handle disconnect
  socket.on('disconnect', () => {
    console.log('❌ Disconnected:', user.name);
    onlineUsers.delete(socket.id);
    io.emit('onlineUsers', Array.from(onlineUsers.values()));
  });
});

//  Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
