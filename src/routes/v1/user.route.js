const express = require("express");
const validate = require("../../middlewares/validate");
const userValidation = require("../../validations/user.validation");
const userController = require("../../controllers/user.controller");

const router = express.Router();

router.get("/:id", validate(userValidation.getUser), async (req, res) => {
    userController.getUser(req,res);
}); 

module.exports = router;
