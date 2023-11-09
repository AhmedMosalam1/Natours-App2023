const appError = require('../utils/appError')

const handelCastError = err => {
    const message = `invalid ${err.path} : ${err.value}.`
    return new appError(message, 400)
}

const handleDuplicateError = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
    const message = `Duplicate field value:${value}. please enter another value `
    return new appError(message, 400)
}

const handleValidationErrorDB = err => {
    const value = Object.values(err.errors).map(el => el.message)
    const message = `Invalid input data. ${value.join('. ')}`
    return new appError(message, 400)
}
const handleJsonWebTokenError = () => {
    return new appError('invalid token. please log in again!', 401)
}
const handleTokenExpiredError = () => {
    return new appError('your token has expired. please log in again', 401)
}


const errDev = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        })
    } else {
        return res.status(err.statusCode).render('error', {
            title: "Something went wrong!",
            msg: err.message
        })
    }
}

const errPro = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            })
        } else {
            return res.status(500).json({
                status: 'error',
                message: 'something went wrong!',
            })
        }
    } else {
        if (err.isOperational) {
            return res.status(err.statusCode).render('error', {
                title: "Something went wrong!",
                msg: err.message
            })
        } else {
            return res.status(err.statusCode).render('error', {
                title: "Something went wrong!",
                msg: "please try again later."
            })
        }
    }

}

const err = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        errDev(err, req, res)
    } else if (process.env.NODE_ENV === 'production') {
        if (err.name === 'CastError') err = handelCastError(err);
        if (err.code == 11000) err = handleDuplicateError(err);
        if (err.name === 'ValidationError') err = handleValidationErrorDB(err)
        if (err.name === 'JsonWebTokenError') err = handleJsonWebTokenError()
        if (err.name === 'TokenExpiredError') err = handleTokenExpiredError()
        errPro(err, req, res)
    }
}
module.exports = err