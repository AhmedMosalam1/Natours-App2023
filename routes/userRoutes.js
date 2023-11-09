const express = require('express')
const router = express.Router()
const user = require("../controllers/userControlllers")
const authUser = require("../controllers/authcontrooler")


router.post("/signup", authUser.signup)
router.post("/login", authUser.login)
router.get("/logout", authUser.logout)
router.post("/forgetPassword", authUser.forgetPassword)
router.patch("/resetPassword/:token", authUser.resetPassword)

router.use(authUser.protect)

router.get("/me", user.getMe, user.getuser)
router.patch("/updatepassword", authUser.updatePassword)
router.patch("/updateme", user.updatePhoto, user.resizePhoto, user.updateme)
router.delete("/deleteme", user.deleteme)


router.use(authUser.restrictTo('admin'))

router.get("/", user.getallusers)
router.post("/", user.postuser)


router.get("/:id", user.getuser)
router.patch("/:id", user.updateuser)
router.delete("/:id", user.deleteuser)



module.exports = router