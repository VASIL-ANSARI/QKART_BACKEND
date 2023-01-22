const httpStatus = require("http-status");
const userService = require("./user.service");
const ApiError = require("../utils/ApiError");
const { User } = require("../models");

/**
 * Login with username and password
 * - Utilize userService method to fetch user object corresponding to the email provided
 * - Use the User schema's "isPasswordMatch" method to check if input password matches the one user registered with (i.e, hash stored in MongoDB)
 * - If user doesn't exist or incorrect password,
 * throw an ApiError with "401 Unauthorized" status code and message, "Incorrect email or password"
 * - Else, return the user object
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if(!user){
    throw new ApiError(httpStatus.UNAUTHORIZED,"Incorrect email or password");
  }
  let newuser = new User({
    name: user.name,
    email: user.email,
    password: user.password,
    walletMoney: user.walletMoney,
    address: user.address,
  });
  const result = await newuser.isPasswordMatch(password);
  console.log(result);
  if(result){
    return user;
  }else{
    throw new ApiError(httpStatus.UNAUTHORIZED,"Incorrect email or password");
  }
};

module.exports = {
  loginUserWithEmailAndPassword,
};