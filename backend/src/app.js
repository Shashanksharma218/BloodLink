const express = require("express");
const connectDB = require("./config/database");

const app = express();
app.use(express.json());



connectDB().then(() => {
    console.log("Database connected successfully :)")
    app.listen(5555, () => {
        console.log("Listening on port 5555...");
    })
}).catch((err) => {
    console.log("Database connection failed!!!", err);
})