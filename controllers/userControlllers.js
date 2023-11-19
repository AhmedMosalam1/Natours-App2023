const user = require("../models/userSchema");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");
const factory = require("./handelrFactory");
const multer = require("multer");
const sharp = require("sharp")
const cloudinary = require("../utils/cloud")

const filterObj = (obj, ...allowFields) => {
    const newFields = {}
    //console.log(Object.keys(obj))
    Object.keys(obj).forEach(el => {
        if (allowFields.includes(el)) newFields[el] = obj[el]
    })
    //console.log(newFields)
    return newFields;
}



// const multerStorage = multer.diskStorage({
//     destination:(req,file,cb) =>{
//         cb(null,'public/img/users')
//     },
//     filename:(req,file,cb) =>{
//         ext=file.mimetype.split('/')[1];
//         cb(null,`user-${req.user.id}-${Date.now()}.ext`)
//     }
// })

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true)
    } else {
        cb(new appError('not an image ! please upload only images..', 400), false)
    }
}
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})
const updatePhoto = upload.single('photo')


const resizePhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next()
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`)

    next()
})




const getMe = (req, res, next) => {
    req.params.id = req.user.id
    next()
}

const getallusers = factory.getAll(user)


const getuser = factory.getOne(user)



const updateuser = factory.updateOne(user)

const updateme = catchAsync(async (req, res, next) => {

    if (req.body.password || req.body.passwordConfirm) {
        return next(new appError("this route is not for password update . please use /updatepassword"))
    }

    const result1 = await cloudinary.uploader.upload(`public/img/users/${req.file.filename}`, {
        public_id: `${req.user.id}_Cover`,
        crop: 'fill',
      });
      
    const filterBody = filterObj(req.body, 'name', 'email')

    if (req.file) filterBody.photo = result1.secure_url

    const result = await user.findByIdAndUpdate(req.user.id, filterBody, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        status: "success",
        data: {
            user: result
        }
    })
})

const postuser = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "this route is not defined , please use /signin instead"
    })
}

const deleteme = catchAsync(async (req, res, next) => {
    await user.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    });
});

const deleteuser = factory.deleteOne(user)

module.exports = { getallusers, getuser, updateuser, deleteuser, postuser, getMe, deleteme, updateme, updatePhoto, resizePhoto }
