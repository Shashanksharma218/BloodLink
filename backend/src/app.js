const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const donorRoutes = require('./routes/donorRoutes');
const requestRoutes = require('./routes/requestRoutes');
const cookieParser = require('cookie-parser');
const app = express();

app.use(cors({
    origin: ["http://localhost:1234"],
    credentials: true
})); 
app.use(express.json());
app.use(cookieParser());

app.use('/api/donors', donorRoutes);

app.use('/api/requests', requestRoutes);//request means blood request.

connectDB().then(() => {
    console.log("Database connected successfully :)")
    app.listen(5555, () => {
        console.log("Listening on port 5555...");
    })
}).catch((err) => {
    console.log("Database connection failed!!!", err);
})