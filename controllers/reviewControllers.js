const review = require("../models/reviewSchema");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");
const factory = require("./handelrFactory");


const getallreviews = factory.getAll(review)

// const getallreviews = catchAsync(async (req, res) => {
//     let filter = {}
//     if(req.params.tourId) filter = {tour:req.params.tourId}
//     const result = await review.find(filter)//.populate("tour user")
//     res.status(500).json({
//         status: "success",
//         length: result.length,
//         data: result
//     })
// })

const getreview = factory.getOne(review)

// const getreview = catchAsync(async(req, res) => {
//     const result = await user.findById(req.params.id)
//     res.status(500).json({
//         status: "success",
//         data: result
//     })
// })

const updatereview = factory.updateOne(review)

const setToursIds = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId
    if (!req.body.user) req.body.user = req.user.id
    next()
}


const postreview = factory.createOne(review)

// const postreview = catchAsync(async(req, res) => {
//     if(!req.body.tour) req.body.tour = req.params.tourId
//     if(!req.body.user) req.body.user = req.user.id
//    const result =  await review.create(req.body)
//     res.status(200).json({
//         status: "success",
//         data: result
//     })
// })



const deletereview = factory.deleteOne(review)

module.exports = { getallreviews, getreview, updatereview, deletereview, postreview, setToursIds }