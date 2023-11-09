const Tour = require('../models/tourSchema')
const Booking = require('../models/bookingSchema')
const crypto = require("crypto")
const catchAsync = require("../utils/catchAsync")
const appError = require("../utils/appError")
const User = require("../models/userSchema")

const getOverview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find()
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
})

const getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: "reviews",
        fields: "review rating user",
    })
    if (!tour) {
        return next(new appError("there is no tour with that name.", 404))
    }
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    });
})

const getMyTours = catchAsync(async (req, res, next) => {
    const booking = await Booking.find({ user: req.user._id })

    const tourIds = booking.map((el) => el.tour._id)
    const tours = await Tour.find({ _id: { $in: tourIds } })

    res.status(200).render('overview', {
        title: "My Tours",
        tours
    })
})

const getLogin = catchAsync(async (req, res, next) => {
    res.status(200).render('login', {
        title: `LOG INTO YOUR ACCOUNT`,
    });
})

const getSignup = catchAsync(async (req, res, next) => {
    res.status(200).render('signup', {
        title: `SignUp With YOUR ACCOUNT`,
    });
})

const forgetPassword = catchAsync(async (req, res, next) => {
    res.status(200).render('forgetPassword', {
        title: `forgetPassword`,
    });
})

const resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    //console.log(hashedToken)   
    const result = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpired: { $gt: Date.now() } })
    //console.log(result)
    if (!result) {
        return next(new appError("Token is invalid and has expired", 400))
    }
    res.status(200).render('resetPassword', {
        title: `resetPassword`,
    });
})


const getAccount = catchAsync(async (req, res, next) => {
    res.status(200).render('account', {
        title: 'Your Account'
    })
})

const updateAccount = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    }, {
        new: true,
        runValidators: true,
    })

    res.status(200).render('account', {
        title: 'your account',
        user: user
    })
})

module.exports = { getOverview, getTour, getLogin, getSignup, getAccount, updateAccount, getMyTours, forgetPassword, resetPassword }