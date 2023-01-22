const express = require("express");
const validate = require("../../middlewares/validate");
const authValidation = require("../../validations/auth.validation");
const authController = require("../../controllers/auth.controller");
const auth = require("../../middlewares/auth");

const router = express.Router();

router.post("/register", validate(authValidation.register) ,async (req, res) => {
    authController.register(req,res);
}); 

router.post("/login", validate(authValidation.login) ,async (req, res) => {
    authController.login(req,res);
}); 
module.exports = router;
