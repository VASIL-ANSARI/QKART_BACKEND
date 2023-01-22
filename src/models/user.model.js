const mongoose = require("mongoose");
// NOTE - "validator" external library and not the custom middleware at src/middlewares/validate.js
const validator = require("validator");
const config = require("../config/config");
const bcrypt = require("bcryptjs");
const { func } = require("joi");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      validate: (value) => {
        return validator.isEmail(value)
      }
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error(
            "Password must contain at least one letter and one number"
          );
        }
        if(value.length < 8){
          throw new Error(
            "Password must be more than 8 characters"
          );
        }
      },
    },
    walletMoney: {
      type: Number,
      required: true,
      default: config.default_wallet_money,
    },
    address: {
      type: String,
      default: config.default_address,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email) {
  return User.exists({email});
};

/**
 * Check if entered password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  //console.log(this);
  const result = await bcrypt.compare(password,this.password);
  //console.log(result);
  return result;
};



/*
 * Create a Mongoose model out of userSchema and export the model as "User"
 * Note: The model should be accessible in a different module when imported like below
 * const User = require("<user.model file path>").User;
 */
/**
 * @typedef User
 */
userSchema.pre("save", function (next) {
  const user = this;
  //console.log(user.password);
  bcrypt.genSalt(10,(err,salt) => {
    if(err)
    return next(err);

    bcrypt.hash(user.password,salt,(err,hash) => {
      if(err) return next(err);
      user.password = hash;
      next();
    });
  });
});
const User = mongoose.model('User', userSchema);
module.exports = {
  User,
};
