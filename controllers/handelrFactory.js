const catchAsync = require("../utils/catchAsync")
const catchError = require("../utils/appError");
const apifeatures = require("../utils/apifeaturies")

const deleteOne = model => catchAsync(async (req, res, next) => {

    const doc = await model.findByIdAndDelete(req.params.id)
    if (!doc) {
        return next(new catchError('no documentfound with that id', 404));
    }
    res.status(201).json({
        success: "success",
        data: {
            tour: doc
        }
    })
})

const updateOne = model => catchAsync(async (req, res, next) => {
    const result = await model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    if (!result) {
        return next(new catchError('no document found with that id', 404));
    }

    res.status(201).json({
        success: "success",
        data: {
            data: result
        }
    })
})


const createOne = model => catchAsync(async (req, res, next) => {
    const result = await model.create(req.body)
    res.status(201).json({
        success: "success",
        data: {
            data: result
        }
    })
})


const getOne = (model, popOptions) => catchAsync(async (req, res, next) => {

    let query = model.findById(req.params.id)
    if (popOptions) query = query.populate(popOptions)

    const result = await query //.populate('reviews');

    if (!result) {
        return next(new catchError('no document found with that id', 404));
    }
    res.status(201).json({
        success: "success",
        data: {
            tour: result
        }
    })
})


const getAll = model => catchAsync(async (req, res, next) => {

    let filter = {}
    if (req.params.tourId) filter = { tour: req.params.tourId }
    const features = new apifeatures(model.find(filter), req.query).filter().sort().limit()
    const doc = await features.query

    res.status(201).json({
        success: "success",
        length: doc.length,
        data: {
            data: doc
        }
    })

})


module.exports = { deleteOne, updateOne, createOne, getOne, getAll }