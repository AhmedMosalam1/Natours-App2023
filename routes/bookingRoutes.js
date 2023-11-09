const express = require('express')
const booking = require("../controllers/bookingController")
const authcontrooler = require('../controllers/authcontrooler')
const router = express.Router()

router.use(authcontrooler.protect)

router.get('/checkout-session/:tourId', booking.getCheckoutSession)

router.use(authcontrooler.restrictTo('admin', 'lead-guide'))

router.get('/', booking.getAllBookings)
router.post('/', booking.createBooking)

router.get('/:id', booking.getBooking)
router.patch('/:id', booking.updateBooking)
router.delete('/:id', booking.deleteBooking)

module.exports = router