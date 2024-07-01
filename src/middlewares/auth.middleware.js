import { ApiError } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'
import { User } from "../models/user.models.js";


const jwtVerify = asyncHandler(async(req,res,next)=>{
// aplyakde acess naslyamule to apn object find kartoy using token 2type madhun token bhetu shkte  header ani cookie
   const token = req.cookies?.accessToken || req.header
    ("Authorization").replace("Bearer ","")
  if(!token){
    throw new ApiError(401,"unothorized request")
  }

//   ata decoded token bhetle aplyala tyala coded madhe covert kela
// verify kela ki login tru ahe na nakki 

  const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
   
// tya token chya through apn to id find karto to user 
  const user = await User.findById(decodedToken?._id).select("-password -refreshToken")


if (!user){
    throw new ApiError(401, "invalid access token")
}

// req through to user obj add kela apn 
req.user = user

next()

})

export {jwtVerify}