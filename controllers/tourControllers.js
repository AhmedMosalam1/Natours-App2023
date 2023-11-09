const express = require("express");
const multer = require("multer");
const sharp = require("sharp")
const app = express()
app.use(express.json())
const tours = require("../models/tourSchema")
const catchAsync = require("../utils/catchAsync")
const factory = require("./handelrFactory");
const AppError = require("../utils/appError");


const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true)
    } else {
        cb(new AppError('not an image ! please upload only images..', 400), false)
    }
}
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

const updatePhotoTour = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 },
])

// upload.single('photo')
// upload.array('images',5)

const resizePhotoTour = catchAsync(async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next()

    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`

    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`)

    //images
    req.body.images = []
    await Promise.all(
        req.files.images.map(async (file, i) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`

            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/tours/${filename}`)

            req.body.images.push(filename)


        })
    )
    next()
})







const getcheaptours = catchAsync(async (req, res, next) => {
    req.query.limit = '5'
    req.query.page = '1'
    const page = req.query.page * 1 || 1
    const limit = req.query.limit * 1 || 100
    const skip = (page - 1) * limit
    const a = req.query.sort = '-ratingsAverage,price'
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
    const fields = req.query.fields.split(',').join(' ')
    const query = tours.find().skip(skip).limit(limit).sort(a).select(fields)
        .then(result => {
            res.status(201).json({
                success: "success",
                length: result.length,
                data: {
                    tour: result
                }
            })
        })
})

const getalltour = catchAsync(async (req, res, next) => {
    const result = await tours.find()
    res.status(201).json({
        success: "success",
        length: result.length,
        data: {
            tour: result
        }
    })
})


const getalltours = factory.getAll(tours)




const posttour = factory.createOne(tours)



const gettour = factory.getOne(tours, { path: 'reviews' }) //(tours)




const edittour = factory.updateOne(tours)


const deletetour = factory.deleteOne(tours)





const gettoursstats = catchAsync(async (req, res, next) => {

    const result = await tours.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                //_id:'$difficulty',
                //_id:null,
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { avgRating: 1 }  //-1
        },
        // {
        //     $match:{ _id :{$ne:'EASY'}}
        // }
    ])
    res.status(201).json({
        success: "success",
        data: {
            tour: result
        }
    })
})


const getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1

    const plan = await tours.aggregate([
        {
            $unwind: "$startDates", //first date
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTours: { $sum: 1 },
                nametours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: {
                _id: 0,
            }
        },
        {
            //$sort:{numTours:-1}
            $sort: { month: -1 }
        },
        {
            $limit: 2
        }
    ])
    res.status(201).json({
        success: "success",
        length: result.length,
        data: {
            tour: plan
        }
    })
})


const getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params
    const [lat, lng] = latlng.split(",")

    const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
        next(new AppError("please provide latitutr and longitude in the format lat,lng.", 400))
    }

    const tour = await tours.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } })
    res.status(200).json({
        status: "success",
        result: tour.length,
        data: tour
    }
    )
})

const getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params
    const [lat, lng] = latlng.split(",")


    if (!lat || !lng) {
        next(new AppError("please provide latitutr and longitude in the format lat,lng.", 400))
    }
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001
    const distance = await tours.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }

    ])
    res.status(200).json({
        status: "success",
        data: distance
    }
    )
})


module.exports = { getalltours, gettour, posttour, edittour, deletetour, gettoursstats, getMonthlyPlan, getToursWithin, getDistances, updatePhotoTour, resizePhotoTour }
