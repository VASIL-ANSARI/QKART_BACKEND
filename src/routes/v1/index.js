const express = require("express");
const userRoute = require("./user.route");

const router = express.Router();
const authRoute = require("./auth.route");
const productRoute = require("./product.route");

router.use("/auth",authRoute);
router.use("/products", productRoute);
router.use("/users", userRoute);

module.exports = router;
