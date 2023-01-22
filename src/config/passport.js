const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const config = require("./config");
const { tokenTypes } = require("./tokens");
const { User } = require("../models");

/**
 * These config options are required
 * Option 1: jwt secret environment variable set in ".env"
 * Option 2: mechanism to fetch jwt token from request Authentication header with the "bearer" auth scheme
 */
const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

/**
 * Logic to find the user matching the token passed
 * - If payload type isn't `tokenTypes.ACCESS` return an Error() with message, "Invalid token type" in the callback function
 * - Find user object matching the decoded jwt token
 * - If there's a valid user, return the user in the callback function
 * - If user not found, return `false` in the user field in the callback function
 * - If the function errs, return the error in the callback function
 *
 * @param payload - the payload the token was generated with
 * @param done - callback function
 */
const jwtVerify = async (payload, done) => {
  //console.log(payload);
  //console.log(Math.floor(Date.now()/1000) + config.jwt.accessExpirationMinutes * 60);
  User.findOne({_id: payload.sub},(err,user) => {
    if(err) return done(err,false,"Error");
    if(payload.type !== tokenTypes.ACCESS){
      return done(null,false,"Invalid token type");
    }
    if(user){
      return done(null,{
        user: user,
      });
    }else{
      return done(err,false,"Error");
    }
  });
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
  jwtStrategy,
};