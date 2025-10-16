const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const donorRoutes = require('./routes/donorRoutes');
const requestRoutes = require('./routes/requestRoutes');

const app = express();

app.use(cors()); 
app.use(express.json());

app.use('/api/donors', donorRoutes);

// This tells the app that any request starting with '/api/requests'
// should be handled by the requestRoutes router.
app.use('/api/requests', requestRoutes);

connectDB().then(() => {
    console.log("Database connected successfully :)")
    app.listen(5555, () => {
        console.log("Listening on port 5555...");
    })
}).catch((err) => {
    console.log("Database connection failed!!!", err);
})