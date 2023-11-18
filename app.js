const express = require("express");
const Limit = require("express-rate-limit")
const path = require("path");
const hpp = require("hpp")
const cookieParser = require("cookie-parser")
const morgan = require("morgan");
const helmet = require("helmet")
const compression = require("compression")
const cors = require("cors")
const xss = require("xss-clean")
const mongoSanitize = require("express-mongo-sanitize")

const app = express();
app.enable("trust proxy")


// Routers
const appError = require("./utils/appError")
const err = require("./controllers/errorController")
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes")
const bookingRouter = require("./routes/bookingRoutes")
const viewRouter = require("./routes/viewRoutes");




app.set("view engine", "pug")
app.set('views', path.join(__dirname, 'views'));

app.use(cors())
app.options('*', cors())

app.use(express.static(`${__dirname}/public`));


app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: {
      allowOrigins: ['*'],
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ['*']
        ,
        'img-src': ["'self'", 's3.amazonaws.com', 'res.cloudinary.com'],
        scriptSrc: ["* data: 'unsafe-eval' 'unsafe-inline' blob:"],
      },
    },
  }),
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = Limit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "too many requests from this ip , please try again in an hour"
})

app.use('/api', limiter);
// Body parser,reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());

app.use(hpp({
  whitelist: ['duration', 'price', 'ratingsQuantity', 'ratingsAverage', 'difficulty', 'maxGroupSize']  //allow duplicate in result
}))

app.use(compression())

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  next()
})


app.use("/", viewRouter)
app.use("/api/tours", tourRouter);
app.use("/api/users", userRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/booking", bookingRouter);

app.all('*', (req, res, next) => {
  next(new appError(`Can't find ${req.originalUrl} on this server `, 404))
})

app.use(err)

module.exports = app
