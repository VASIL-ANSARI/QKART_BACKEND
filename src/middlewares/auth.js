const passport = require("passport");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

/**
 * Custom callback function implementation to verify callback from passport
 * - If authentication failed, reject the promise and send back an ApiError object with
 * --- Response status code - "401 Unauthorized"
 * --- Message - "Please authenticate"
 *
 * - If authentication succeeded,
 * --- set the `req.user` property as the user object corresponding to the authenticated token
 * --- resolve the promise
 */
const verifyCallback = (req, resolve, reject) => async (err, user, info) => {
  req.user = user.user;
  const tokenString = req.headers.authorization;
  if(tokenString === undefined || tokenString.length === 0){
    reject(new ApiError(httpStatus.UNAUTHORIZED,"Token not found"));
  }else{
    const token = tokenString.split(' ');
    //console.log(token[1]);
    jwt.verify(token[1],config.jwt.secret,(err,decoded)=>{
      if(err){
        //console.log(err);
        reject(new ApiError(httpStatus.UNAUTHORIZED,"Token expired"));
      }else{
        //console.log(decoded, new Date()/1000);
        if(decoded.exp < new Date()/1000){
          reject(new ApiError(httpStatus.UNAUTHORIZED,"Token expired"));
        }   
      }
    });
    if(err){
      reject(new ApiError(httpStatus.UNAUTHORIZED,"Please authenticate"));
    }else if(!user){
      reject(new ApiError(httpStatus.UNAUTHORIZED,"Please authenticate"));
      //throw new ApiError(httpStatus.UNAUTHORIZED,"Please authenticate")
    }else if(req.params.id && user.user.id != req.params.id){
      reject(new ApiError(httpStatus.FORBIDDEN,"User not found"));
    }
    else{
      resolve(user);
    }
  }
  
};

/**
 * Auth middleware to authenticate using Passport "jwt" strategy with sessions disabled and a custom callback function
 * 
 */
const auth = async (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate(
      "jwt",
      { session: false },
      verifyCallback(req, resolve, reject)
    )(req, res, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};

module.exports = auth;
