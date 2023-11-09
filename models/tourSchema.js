const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const users = require("../models/userSchema");

const tourSchema = new mongoose.Schema({
    id: Number,
    name: {
        type: String,
        required: [true, "a tour must have a name"],
        unique: true,
        maxlength: [40, "a tour name must have less or equal 40 characters"],
        minlength: [10, "a tour name must have more or equal 10 characters"],
        
    },
    slug: String,
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, "rating must be above 1"],
        max: [5, "rating must be below 5"],
        set: val => Math.round(val * 10)
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
    },
    duration: {
        type: Number,
        required: [true, "a tour must have a duration"],
    },
    difficulty: {
        type: String,
        required: [true, "a tour must have a difficulty"],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: "difficulty must be easy or medium or difficult"
        }
    },
    maxGroupSize: {
        type: Number,
        required: [true, "a tour must have a maximum group size"],
    },
    price: {
        type: Number,
        required: [true, "a tour must have a price"],
    },
    pricediscount: {
        type: Number,
        validate: {
            validator: function (val) {
                return val < this.price
            },
            message: "Discount price ({VALUE}) should be below regular price"
        }
    },
    summary: {
        type: String,
        trim: true, //remove spaces in the start and end text
        required: [true, "a tour must have a summary"]
    },
    description: {
        type: String,
        trim: true,
        required: [true, "a tour must have a description"]
    },
    imageCover: {
        type: String,
        required: [true, "a tour must have cover image"]
    },
    images: [String],
    createdat: {
        type: Date,
        default: Date.now(),
        select: false,
    },
    startDates: [Date],
    secrettour: {
        type: Boolean,
        default: false,
    },
    startLocation: {
        type: {
            type: String,
            default: "Point",
            enum: ['Point']
        },
        coordinates: [Number],
        adderss: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: "Point",
                enum: ['Point']
            },
            coordinates: [Number],
            adderss: String,
            description: String,
            day: Number
        }

    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,///Array 
            ref: "User"
        }
    ]
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    })

// tourSchema.index({prics:1})
tourSchema.index({ price: 1, ratingsAverage: -1 })
tourSchema.index({ slug: 1 })
tourSchema.index({ startLocation: "2dsphere" })


tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
})

tourSchema.virtual('reviews', {
    ref: "Review",
    foreignField: "tour",
    localField: "_id"
})

//document middleware

tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true })
    next()
})



// query middleware
tourSchema.pre(/^find/, function (next) {
    //tourSchema.pre('find', function(next){
    // this.find({secrettour:{$ne:true}})
    this.start = Date.now()
    next()
})

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: "guides",
        select: "-__v -passwordChangedAt -passwordResetExpired"
    })//.populate("reviews")  
    next()
})



const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour