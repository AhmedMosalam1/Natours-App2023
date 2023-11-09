const express = require('express')
const router = express.Router()
const tour = require("../controllers/tourControllers")
const user = require('../controllers/authcontrooler')
//const review = require('../controllers/reviewControllers')
const review = require('../routes/reviewRoutes')


router.use('/:tourId/reviews', review)

router.get("/", tour.getalltours)
router.get("/stats", tour.gettoursstats)
router.get("/month/:year", user.protect, user.restrictTo('admin', 'lead-guide', 'guide'), tour.getMonthlyPlan)
router.get("/:id", tour.gettour)
router.post("/", user.protect, user.restrictTo('admin', 'lead-guide'), tour.posttour)
//router.post("/:tourId/reviews",user.protect,user.restrictTo("user"),review.postreview)
router.patch("/:id", user.protect, user.restrictTo('admin', 'lead-guide'), tour.updatePhotoTour, tour.resizePhotoTour, tour.edittour)
router.delete("/:id", user.protect, user.restrictTo('admin', 'lead-guide'), tour.deletetour)

router.get("/tours-within/:distance/center/:latlng/unit/:unit", tour.getToursWithin)
router.get("/tours-within/distances/:latlng/unit/:unit", tour.getDistances)


module.exports = router