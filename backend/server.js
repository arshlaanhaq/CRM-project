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

// ✅ CORS middleware for API routes
app.use(cors({
  origin: ['http://localhost:3000', 'https://crm-project-frontend-hazel.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,              // important for cookies/auth headers
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

//  Setup Socket.IO with JWT auth and proper CORS including credentials: true
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://crm-project-frontend-hazel.vercel.app'],
    methods: ['GET', 'POST'],
    credentials: true,    // *** This is the fix ***
  },
});

global.io = io; // optional global use

const onlineUsers = new Map();
io.use(socketAuth); // Apply socket auth middleware
io.on('connection', (socket) => {
  const user = socket.user;

  onlineUsers.set(user._id.toString(), {
    socketId: socket.id,   // store socket id if needed
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  // Prepare arrays without duplicates because Map keys are unique by user ID
  const onlineUsersArray = Array.from(onlineUsers.values());
  const onlineTechnicians = onlineUsersArray.filter(u => u.role === 'technician');
  const onlineStaff = onlineUsersArray.filter(u => u.role === 'staff');

  io.emit('onlineUsers', {
    all: onlineUsersArray,
    technicians: onlineTechnicians,
    staff: onlineStaff,
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(user._id.toString());
    io.emit('onlineUsers', Array.from(onlineUsers.values()));
  });
});
// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
