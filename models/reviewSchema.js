const mongoose = require('mongoose');
const tour = require("./tourSchema")

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'review can noy be empty!']
    },
    rating: {
        type: Number,
        default: 2.5,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: "Tour",
        required: [true, "review must be belong a tour"]
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "review must be belong a user"]
    },

},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        // add id to data in display mode  not in DB
    })

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ])
    console.log(stats)
    if (stats.length > 0) {
        await tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        })
    } else {
        await tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        })
    }
}

reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

reviewSchema.post("save", function () {

    this.constructor.calcAverageRatings(this.tour)
})

reviewSchema.pre(/^findOneAnd/, async function () {
    this.r = await this.findOne()
    next()
})

reviewSchema.post(/^findOneAnd/, async function () {
    await this.r.constructor.calcAverageRatings(this.r.tour)
})

reviewSchema.pre(/^find/, function (next) {
    // this.populate({
    //     path:"tour",
    //     select:"name"
    // }).populate({
    //     path:"user",
    //     select:"name photo"
    // })
    this.populate({
        path: "user",
        select: "name photo"
    })
    next()
})

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review