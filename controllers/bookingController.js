const catchAsync = require("../utils/catchAsync")
const factory = require("./handelrFactory");
const AppError = require("../utils/appError");
const Tour = require("../models/tourSchema")
const booking = require("../models/bookingSchema")


exports.checkIfBooked = catchAsync(async (req, res, next) => {
  const booking = await booking.find({
    user: req.user.id,
    tour: req.body.tour
  });

  if (booking.length === 0)
    return next(new AppError('You must buy this tour to review it', 401));
  next();
});


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // 2) Create Checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    mode: 'payment',
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `https://www.natours.dev/img/tours/${tour.imageCover}`
            ]
          }
        }
      }
    ]
  });
  console.log(tour)
  // 3) Create Session as response
  res.status(200).json({
    status: 'success',
    session
  });

});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query

  if (!tour && !user && !price) return next();

  await booking.create({ tour, user, price })

  res.redirect(req.originalUrl.split('?')[0])
})

exports.createBooking = factory.createOne(booking);
exports.getBooking = factory.getOne(booking);
exports.getAllBookings = factory.getAll(booking);
exports.updateBooking = factory.updateOne(booking);
exports.deleteBooking = factory.deleteOne(booking);