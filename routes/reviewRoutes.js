const express = require('express')
const review = require("../controllers/reviewControllers")
const booking = require("../controllers/bookingController")
const authcontrooler = require('../controllers/authcontrooler')
const router = express.Router({ mergeParams: true })


router.use(authcontrooler.protect)

router.get("/", review.getallreviews)
router.get("/:id", review.getreview)
router.post("/", authcontrooler.protect, authcontrooler.restrictTo('user'), review.setToursIds, booking.checkIfBooked, review.postreview)
router.patch("/:id", authcontrooler.restrictTo("admin", "user"), review.updatereview)
router.delete("/:id", authcontrooler.restrictTo("admin", "user"), review.deletereview)


module.exports = router