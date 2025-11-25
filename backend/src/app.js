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

const FRONTEND_URL = "https://blood-link-ashen.vercel.app";
const ALLOWED_ORIGINS = [FRONTEND_URL, "http://localhost:1234"];

app.use(cors({
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
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