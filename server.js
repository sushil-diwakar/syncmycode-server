const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const codeRoutes = require('./routes/codeRoutes');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Update with your frontend URL if necessary
        methods: ['GET', 'POST', 'PUT'],
    },
});

// Middleware
app.use(express.json());
app.use(cors());

// Connect to Database
connectDB();

// Routes
app.use('/api/code', codeRoutes);

// Socket.io for real-time collaboration
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('join', (roomId) => {
        console.log(`Client joined room: ${roomId}`);
        socket.join(roomId);
    });

    socket.on('edit', ({ roomId, content }) => {
        console.log(`Received edit for room: ${roomId}`);
        socket.to(roomId).emit('text-change', content); // Broadcast changes
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
