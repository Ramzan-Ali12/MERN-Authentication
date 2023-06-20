import express  from "express";
const router=express.Router();
import UserController from "../Controller/UserController.js";
import checkUserAut from "../middleware/usermiddleware.js";
// Route Level Middleware -To Protect Route
router.use('/changepassword',checkUserAut)
router.use('/showData',checkUserAut)
router.use('/loggeduser',checkUserAut)

// public Routes
router.post('/register',UserController.userRegistration)

router.post('/login',UserController.userLogin)

router.post('/send-reset-password-email',UserController.sendUserPasswordResetEmail)
// send reset password link
router.post('/reset-password/:id/:token',UserController.userPasswordReset)

router.delete('/delete',UserController.deleteData)
// Private Routes
router.post('/changepassword',UserController.changeUserPassword)
router.use('/showData',UserController.showData)
router.get('/loggeduser', UserController.loggedUser)


export default router