const Email = require("../utils/mail");
const crypto = require('crypto');
const users = require('../models/userSchema');
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError')
const { promisify } = require('util')
const jwt = require('jsonwebtoken');



const createSendToken = (res, result, statusCode) => {
  
  const token = result.generateToken(result._id)

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE_IN * 24 * 60 * 60 * 1000),
    httpOnly: true, 
  }

  if (process.env.NODE_ENV == "production") cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions)

  result.password = undefined

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      result
    }
  })
}




const signup = catchAsync(async (req, res) => {
  //const result = user.create(req.body);
  const result = await users.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  })
 // console.log(result)
  const url = `${req.protocol}://${req.get('host')}/me`
  //  console.log(url)
  await new Email(result, url).sendWelcome()
  .then()
  .catch(err =>{
    console.log(err)
  })
  createSendToken(res, result, 200)
})

const login = catchAsync(async (req, res, next) => {

  const { email, password } = req.body

  if (!email || !password) {
    return next(new appError('please enter a valid email or password', 400))
  }
  const result = await users.findOne({ email }).select('+password')

  if (!result || !(await result.correctPassword(password, result.password))) {
    return next(new appError('Incorrect Email or Password', 401))
  }

  createSendToken(res, result, 200)
})


const logout = catchAsync(async (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() - 10 * 1000),
    httpOnly: true,
    secure: true
  });
  res.status(200).json({ status: 'success' });
})


const protect = catchAsync(async (req, res, next) => {
  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt
  }
  if (!token) {
    return next(new appError('you are not logged in! please log in to get access'), 401)
  }
  const accessToken = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

  const freshUser = await users.findById(accessToken.id)
  if (!freshUser) {
    return next(new appError("this user to this token not longer exists"), 401);
  }

  if (freshUser.changePassword(accessToken.iat)) {
    return next(new appError("User recently changed password! log in again", 401))
  }
  req.user = freshUser
  res.locals.user = freshUser;

  next()
})


const loggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await users.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changePassword(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;

      return next();

    } catch (e) {
      console.log(e.message)
      return next();
    }

  }
  next();
};




const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new appError("you  do not have permission to perform this action", 403));
    }
    next()
  }
}

const forgetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const u = await users.findOne({ email: req.body.email });
  if (!u) {
    return next(new appError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = u.createtPasswordResetToken();
  await u.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/resetPassword/${resetToken}`;

    // const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
    //   await sendEmail({
    //     email: u.email,
    //     subject: 'Your password reset token (valid for 10 min)',
    //     message
    //   });

    await new Email(u, resetURL).sendPasswordReset()

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    u.passwordResetToken = undefined;
    u.passwordResetExpires = undefined;
    await u.save({ validateBeforeSave: false });

    return next(
      new appError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
  //console.log(hashedToken)   
  const result = await users.findOne({ passwordResetToken: hashedToken, passwordResetExpired: { $gt: Date.now() } })
  //console.log(result)
  if (!result) {
    return next(new appError("Token is invalid and has expired", 400))
  }

  result.password = req.body.password
  result.passwordConfirm = req.body.passwordConfirm
  result.passwordResetToken = undefined
  result.passwordResetExpired = undefined

  await result.save()

  createSendToken(res, result, 200)

})



const updatePassword = catchAsync(async (req, res, next) => {

  const result = await users.findById(req.user.id).select('+password')


  if (!(await result.correctPassword(req.body.passwordCurrent, result.password))) {
    return next(new appError("Your current password is incorrect", 401))
  }

  //console.log(req.body)
  result.password = req.body.password
  result.passwordConfirm = req.body.passwordConfrim

  await result.save()

  createSendToken(res, result, 200)

})

module.exports = { signup, login, protect, restrictTo, forgetPassword, resetPassword, updatePassword, loggedIn, logout }