const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const donorRoutes = require('./routes/donorRoutes');
const requestRoutes = require('./routes/requestRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration - Allow requests from localhost and network IPs
const allowedOrigins = [
    "http://localhost:1234",
    // Add your laptop's IP address here when hosting on network
    // Example: "http://192.168.1.100:1234"
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        // Allow requests from any local network IP (for development)
        if (origin.includes('localhost') || 
            origin.match(/^http:\/\/192\.168\.\d+\.\d+:\d+$/) ||
            origin.match(/^http:\/\/10\.\d+\.\d+\.\d+:\d+$/) ||
            origin.match(/^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+:\d+$/)) {
            return callback(null, true);
        }
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
})); 
app.use(express.json());
app.use(cookieParser());

app.use('/api/donors', donorRoutes);

app.use('/api/requests', requestRoutes);//request means blood request.

app.use('/api/certificates', certificateRoutes);

app.use('/api/hospitals', hospitalRoutes);

app.use('/api/notifications', notificationRoutes);

connectDB().then(() => {
    console.log("Database connected successfully :)")
    // Listen on all network interfaces (0.0.0.0) to accept connections from other devices
    const PORT = process.env.PORT || 5555;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server listening on port ${PORT}...`);
        console.log(`Local access: http://localhost:${PORT}`);
        console.log(`Network access: http://YOUR_IP:${PORT}`);
    })
}).catch((err) => {
    console.log("Database connection failed!!!", err);
})