const mongoose = require('mongoose')
const fs = require('fs')
require("dotenv").config();

const tour = require("../../models/tourSchema");
const review = require("../../models/reviewSchema");
const user = require("../../models/userSchema");



mongoose
    .connect(process.env.DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
    });



const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, "utf-8"))
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"))

//import
const importdata = async () => {
    try {
        await tour.create(tours)
        await review.create(reviews)
        await user.create(users, { validateBeforeSave: false })
        console.log("Data Created successfully")
    } catch (err) {
        console.log(err)
    }
    process.exit();
}

//delete

const deletedata = async () => {
    try {
        await tour.deleteMany()
        await review.deleteMany()
        await user.deleteMany()
        console.log("Data Deleted successfully")
    } catch (err) {
        console.log(err)
    }
    process.exit();
}


if (process.argv[2] === "-import") {
    importdata()
} else if (process.argv[2] === "-delete") {
    deletedata()
}

    //console.log("Data Deleted successfully")