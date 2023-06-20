import  Jwt  from "jsonwebtoken";
import UserModel from "../Model/user.js";
var checkUserAut=async(req,res,next)=>{
    let token
    const { authorization }=req.headers
    if (authorization && authorization.startsWith('Bearer')) {
        try {
            token=authorization.split(' ')[1]
            // console.log('Token',token)
            // console.log('Authorization',authorization)
            //  verify Token
            const{userID}=Jwt.verify(token,process.env.JWT_SECRET_KEY)
            // console.log(userID)
            // Get User from Token
            req.user=await UserModel.findById(userID).select('-Password')
            // console.log(req.user)
            next()
        } 
        catch (error)
        {
            console.log(error)
            res.status(401).send({"status":"failed","message":"Unauthorized User"})
        }
    } 
    if(!token)
    {
    res.status(401).send({"status":"failed","message":"Unauthorized User,No Token"})
    }
        
}

export default checkUserAut