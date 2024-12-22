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

// Frontend URLs
const allowedOrigins = [
    'http://localhost:3000', // Frontend URL 1 (React dev server)
    'https://yourfrontendurl.com', // Frontend URL 2 (production URL)
];

// Socket.io with CORS options
const io = new Server(server, {
    cors: {
        origin: function(origin, callback) {
            if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
                callback(null, true); // Allow request
            } else {
                callback(new Error('Not allowed by CORS')); // Reject request
            }
        },
        methods: ['GET', 'POST', 'PUT'],
    },
});

// Middleware
app.use(express.json());

// CORS middleware configuration for express
app.use(cors({
    origin: function(origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true); // Allow request
        } else {
            callback(new Error('Not allowed by CORS')); // Reject request
        }
    },
    methods: ['GET', 'POST', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'], // Adjust headers if needed
}));

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