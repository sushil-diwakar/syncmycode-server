const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const codeRoutes = require('./routes/codeRoutes');
const path = require('path');

dotenv.config();
const app = express();
const server = http.createServer(app);

// Frontend URLs
const allowedOrigins = [
    'http://localhost:3000', // React dev server (local)
    'http://takesarkarinaukri.com', // Your VPS IP address
    'https://syncmycode.onrender.com', // Production URL
];

// Socket.io with CORS options
const io = new Server(server, {
    cors: {
        origin: function (origin, callback) {
            if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
                callback(null, true); // Allow request
            } else {
                callback(new Error('Not allowed by CORS')); // Reject request
            }
        },
        methods: ['GET', 'POST', 'PUT'],
        transports: ['websocket', 'polling'], // Allow both WebSocket and Polling (for fallback)
    },
});

// Middleware for JSON parsing
app.use(express.json());

// CORS middleware configuration for express (if needed)
app.use(cors({
    origin: function (origin, callback) {
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

// API Routes
app.use('/api/code', codeRoutes);

// Socket.io for real-time collaboration
io.on('connection', (socket) => {
    console.log('New client connected');

    // Listen for joining a room (editor session)
    socket.on('join', (roomId) => {
        console.log(`Client joined room: ${roomId}`);
        socket.join(roomId);
    });

    // Listen for edits to the code in the editor
    socket.on('edit', ({ roomId, content }) => {
        console.log(`Received edit for room: ${roomId}`);
        socket.to(roomId).emit('text-change', content); // Broadcast text changes to all other clients in the room
    });

    // Handle disconnections
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Serve static files in production (after building React app)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));

    // Catch-all route to serve index.html for all non-API routes
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}

// Error Handling Middleware (for uncaught errors)
app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));