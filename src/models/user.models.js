import mongoose,{Schema} from "mongoose"; 
import jwt from 'jsonwebtoken' 
import bcrypt from 'bcrypt' 
const userSchema = new Schema({ 
    username:{ 
        type:String,
         required:true, 
         unique:true, 
         lowercase:true,
          trim:true,
          index:true
        },
    fullname:{ 
        type:String, 
        required:true,
         trim:true, 
         index:true 
        }, 
    avatar:{ 
        type:String, // cloudinary URL required:true,
         },
    coverimage:{
        type:String, // cloudinary URL
              },
    watchhistory:[ 
        { 
        type:Schema.Types.ObjectId,
        ref:'Videos' 
        } 
    ],
    password:{ 
         type:String, 
         required:[true,'password id required'] 
        },
    refreshtoken:{
         type:String 
        }
},{timestamps:true})
    userSchema.pre('save',async function(next){ 
    if(!this.isModified("password")) return next() 
        this.password = bcrypt.hash(this.password,10)
        next() 
     }) 
     userSchema.methods.ispasswordcorrect = async function(password){
    return await bcrypt.compare(password, this.password)
    }

export const User = mongoose.model('User',userSchema) 