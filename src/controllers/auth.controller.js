const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { authService, userService, tokenService } = require("../services");

/**
 * Perform the following steps:
 * -  Call the userService to create a new user
 * -  Generate auth tokens for the user
 * -  Send back
 * --- "201 Created" status code
 * --- response in the given format
 *
 * Example response:
 *
 * {
 *  "user": {
 *      "_id": "5f71b31888ba6b128ba16205",
 *      "name": "crio-user",
 *      "email": "crio-user@gmail.com",
 *      "password": "$2a$08$bzJ999eS9JLJFLj/oB4he.0UdXxcwf0WS5lbgxFKgFYtA5vV9I3vC",
 *      "createdAt": "2020-09-28T09:55:36.358Z",
 *      "updatedAt": "2020-09-28T09:55:36.358Z",
 *      "__v": 0
 *  },
 *  "tokens": {
 *      "access": {
 *          "token": "eyJhbGciOiJIUz....",
 *          "expires": "2020-10-22T09:29:01.745Z"
 *      }
 *  }
 *}
 *
 */
const register = catchAsync(async (req, res) => {
  const userObj = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  }
 // console.log(userObj);
  try{
    const response = await userService.createUser(userObj);
    const tokenResp = await tokenService.generateAuthTokens(response);
    const finalResponse = {"user":response,"tokens":tokenResp};
    //console.log(finalResponse);
    res.status(201).send(finalResponse);
  }catch(err){
    //console.log(err);
    if(err.statusCode){
      res.status(err.statusCode).send(err.message);
    }else{
      res.status(httpStatus.BAD_REQUEST).send(err.message);
    }
    
  }
  
});

/**
 * Perform the following steps:
 * -  Call the authservice to verify is password and email is valid
 * -  Generate auth tokens
 * -  Send back
 * --- "200 OK" status code
 * --- response in the given format
 *
 * Example response:
 *
 * {
 *  "user": {
 *      "_id": "5f71b31888ba6b128ba16205",
 *      "name": "crio-user",
 *      "email": "crio-user@gmail.com",
 *      "password": "$2a$08$bzJ999eS9JLJFLj/oB4he.0UdXxcwf0WS5lbgxFKgFYtA5vV9I3vC",
 *      "createdAt": "2020-09-28T09:55:36.358Z",
 *      "updatedAt": "2020-09-28T09:55:36.358Z",
 *      "__v": 0
 *  },
 *  "tokens": {
 *      "access": {
 *          "token": "eyJhbGciOiJIUz....",
 *          "expires": "2020-10-22T09:29:01.745Z"
 *      }
 *  }
 *}
 *
 */
const login = catchAsync(async (req, res) => {
  try{
    const response = await authService.loginUserWithEmailAndPassword(req.body.email,req.body.password);
    const tokenResp = await tokenService.generateAuthTokens(response);
    const finalResponse = {"user":response,"tokens":tokenResp};
    console.log("login" , finalResponse);
    res.status(200).send(finalResponse);
  }catch(err){
    if(err.statusCode){
      res.status(err.statusCode).send({code: err.statusCode,message: err.message});
    }else{
      res.status(httpStatus.BAD_REQUEST).send(err.message);
    }
  }
  
});

module.exports = {
  register,
  login,
};
