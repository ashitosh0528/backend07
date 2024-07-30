import { Router } from "express";
import {logOutUser, loginUser, registerUser,refreshToken,getCurrentUser} from "../controllers/user.controler.js"
import { jwtVerify } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { requestOTP,verifyOTP } from "../controllers/authController.js";
const router = Router();

router.route('/register').post(
    upload.fields([
        {name:'avatar',maxCount:1},{name:'coverimage',maxCount:1}
    ]),
    registerUser)

    router.route('/login').post(loginUser)

    router.route('/logout').post(jwtVerify,logOutUser)
    router.route('/refresh-token').post(refreshToken)

    router.route('/current-user').get(jwtVerify,
        (req, res) => {
        res.json(req.user);
      },getCurrentUser)


      router.post('/request-otp', requestOTP);
      router.post('/verify-otp', verifyOTP);


export default router;