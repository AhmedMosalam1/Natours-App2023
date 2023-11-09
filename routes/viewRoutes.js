const express = require('express');
const veiwControlles = require('../controllers/viewController')
const router = express.Router();
const auth = require('../controllers/authcontrooler')
const booking = require('../controllers/bookingController')

router.get("/", booking.createBookingCheckout, auth.loggedIn, veiwControlles.getOverview)
router.get("/tour/:slug", auth.loggedIn, veiwControlles.getTour)
router.get("/login", auth.loggedIn, veiwControlles.getLogin)
router.get("/SignUp", auth.loggedIn, veiwControlles.getSignup)
router.get("/forgetPassword", auth.loggedIn, veiwControlles.forgetPassword)
router.get("/resetPassword/:token", auth.loggedIn, veiwControlles.resetPassword)
router.get("/me", auth.protect, veiwControlles.getAccount)
router.get("/get-tours", auth.protect, veiwControlles.getMyTours)
router.post("/submit-user-data", auth.protect, veiwControlles.updateAccount)

module.exports = router; 