import { ApiError } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'
import { User } from "../models/user.models.js";


// const jwtVerify = asyncHandler(async(req,res,next)=>{
// // aplyakde acess naslyamule to apn object find kartoy using token 2type madhun token bhetu shkte  header ani cookie
// const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];

// if (!token) {
//   throw new ApiError(401, "Unauthorized request");
// }
// //   ata decoded token bhetle aplyala tyala coded madhe covert kela
// // verify kela ki login tru ahe na nakki 
// console.log(token)
//   const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
// // console.log(decodedToken)
   
// // tya token chya through apn to id find karto to user 
//   const user = await User.findById(decodedToken?._id).select("-password -refreshToken")


// if (!user){
//     throw new ApiError(401, "invalid access token")
// }

// // req through to user obj add kela apn 
// req.user = user

// next()

// })


const jwtVerify = asyncHandler(async (req, res, next) => {
  // console.log('Headers:', req.headers);
  // console.log('Cookies:', req.cookies);

  const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
  console.log('Extracted Token:', token);

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log('Decoded Token:', decodedToken);

    const user = await User.findById(decodedToken._id).select("-password -refreshToken");
    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new ApiError(401, "Invalid access token");
  }
});

export {jwtVerify}


