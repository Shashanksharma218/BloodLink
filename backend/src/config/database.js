const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose.connect("mongodb+srv://shashank23154:JIgIwELZzczgsNmH@db154.mxyqrt4.mongodb.net/BloodLink");
}

module.exports = connectDB;


