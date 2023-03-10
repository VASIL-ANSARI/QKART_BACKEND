const httpStatus = require("http-status");
const { Cart, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");


/**
 * Fetches cart for a user
 * - Fetch user's cart from Mongo
 * - If cart doesn't exist, throw ApiError
 * --- status code  - 404 NOT FOUND
 * --- message - "User does not have a cart"
 *
 * @param {User} user
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const getCartByUser = async (user) => {
  const cart = await Cart.findOne({email: user.email});
  if(!cart){
    throw new ApiError(httpStatus.NOT_FOUND,"User does not have a cart");
  }else{
    return cart;
  }
};

/**
 * Adds a new product to cart
 * - Get user's cart object using "Cart" model's findOne() method
 * --- If it doesn't exist, create one
 * --- If cart creation fails, throw ApiError with "500 Internal Server Error" status code
 *
 * - If product to add already in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product already in cart. Use the cart sidebar to update or remove product from cart"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - Otherwise, add product to user's cart
 *
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const addProductToCart = async (user, productId, quantity) => {
  let cart = await Cart.findOne({email: user.email});
  let responseCart = cart;
  if(!cart){
    let newCart = {
      email: user.email,
      cartItems: [],
    }
    responseCart = await Cart.create(newCart);

    if(!responseCart){
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR,"Internal Server Error");
    }
  }
  else{
    responseCart = cart;
  }
  if(responseCart.cartItems.length > 0){
    //console.log(responseCart.cartItems[0].product, productId);
    const updatedCart = responseCart.cartItems.filter(item => item.product._id.equals(productId));
    //console.log(updatedCart,productId);
    if(updatedCart.length > 0){
      throw new ApiError(httpStatus.BAD_REQUEST,"Product already in cart. Use the cart sidebar to update or remove product from cart");
    }
  }
  const product = await Product.findOne({_id: productId});
  if(!product){
    throw new ApiError(httpStatus.BAD_REQUEST,"Product doesn't exist in database");
  }
  responseCart.cartItems.push({product: product, quantity: quantity});
  //console.log(responseCart);
  await responseCart.save();
  return responseCart;
};

/**
 * Updates the quantity of an already existing product in cart
 * - Get user's cart object using "Cart" model's findOne() method
 * - If cart doesn't exist, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart. Use POST to create cart and add a product"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * - Otherwise, update the product's quantity in user's cart to the new quantity provided and return the cart object
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const updateProductInCart = async (user, productId, quantity) => {
  let cart = await Cart.findOne({email: user.email});
  if(!cart){
    throw new ApiError(httpStatus.BAD_REQUEST,"User does not have a cart. Use POST to create cart and add a product");
  }
  const product = await Product.findOne({_id:productId});
  if(!product){
    throw new ApiError(httpStatus.BAD_REQUEST,"Product doesn't exist in database");
  }
  //console.log(cart.cartItems, productId);
  const previousSize = cart.cartItems.length;
  cart.cartItems.splice(cart.cartItems.findIndex(e => e.product._id.equals(productId)),1);
  const newSize = cart.cartItems.length;
  if(previousSize === newSize){
    console.log(cart.cartItems,productId);
    throw new ApiError(httpStatus.BAD_REQUEST,"Product not in cart");
  }
  //console.log(cart.cartItems,productId);
  cart.cartItems.push({product: product, quantity: quantity});
  // cart.cartItems = updatedCart;
  //console.log(cart);
  await cart.save();
  return cart;
};

/**
 * Deletes an already existing product in cart
 * - If cart doesn't exist for user, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * Otherwise, remove the product from user's cart
 *
 *
 * @param {User} user
 * @param {string} productId
 * @throws {ApiError}
 */
const deleteProductFromCart = async (user, productId) => {
  let cart = await Cart.findOne({email: user.email});
  if(!cart){
    throw new ApiError(httpStatus.BAD_REQUEST,"User does not have a cart");
  }
  const updatedCart = cart.cartItems.filter(item => item.product._id.equals(productId));
  if(updatedCart.length === 0){
    throw new ApiError(httpStatus.BAD_REQUEST,"Product not in cart");
  }
  cart.cartItems = updatedCart;
  //console.log(cart);
  const idToUpdate = cart._id;
  return Cart.findByIdAndUpdate(idToUpdate,cart);
};

/**
 * Checkout a users cart.
 * On success, users cart must have no products.
 *
 * @param {User} user
 * @returns {Promise}
 * @throws {ApiError} when cart is invalid
 */
const checkout = async (user) => {
  let cart = await Cart.findOne({email: user.email});
  // console.log(cart);
  if(!cart){
    throw new ApiError(httpStatus.NOT_FOUND,"User does not have a cart");
  }
  if(cart.cartItems.length === 0){
    throw new ApiError(httpStatus.BAD_REQUEST,"No product found");
  }
  const result = await user.hasSetNonDefaultAddress();
  //console.log(result);
  if(!result){
    throw new ApiError(httpStatus.BAD_REQUEST,"No address found");
  }
  let total = 0;
  const listsOfProducts = cart.cartItems;
 // console.log(listsOfProducts);
  for(const prod of listsOfProducts){
    //console.log(prod);
    total = total + prod.quantity * prod.product.cost;
  }
  if(total > user.walletMoney){
    throw new ApiError(httpStatus.BAD_REQUEST,"Insufficient balance");
  }
  user.walletMoney  = user.walletMoney - total;
  //console.log(user);
  //await user.save();
  cart.cartItems = [];
  //console.log(cart);
  await cart.save();
  return cart;
};

module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout,
};
