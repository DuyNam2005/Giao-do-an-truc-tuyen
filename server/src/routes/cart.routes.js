const express = require('express');
const router = express.Router();

const controllerCart = require('../controllers/cart.controller');

const { authUser, asyncHandler } = require('../auth/checkAuth');

router.post('/create', authUser, asyncHandler(controllerCart.createCart));
router.get('/get-cart', authUser, asyncHandler(controllerCart.getCart));
router.put('/update-quantity', authUser, asyncHandler(controllerCart.updateQuantity));
router.delete('/remove/:productId', authUser, asyncHandler(controllerCart.removeCartItem));
router.post('/update-info', authUser, asyncHandler(controllerCart.updateInfoCart));

module.exports = router;
