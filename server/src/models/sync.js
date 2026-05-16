const User = require('./users.model');
const apikey = require('../models/apiKey.model');
const product = require('../models/product.model');
const category = require('../models/category.model');
const cart = require('../models/cart.model');
const payments = require('../models/payments.model');
const coupon = require('../models/coupon.model');
const previewProduct = require('../models/previewProduct.model');
const favouriteProduct = require('../models/favouriteProduct.model');
const question = require('../models/question.model');
const otp = require('../models/otp.model');

// User - Cart
User.hasMany(cart, { foreignKey: 'userId' });
cart.belongsTo(User, { foreignKey: 'userId' });

// User - Payments
User.hasMany(payments, { foreignKey: 'userId' });
payments.belongsTo(User, { foreignKey: 'userId' });

// Product - PreviewProduct
product.hasMany(previewProduct, { foreignKey: 'productId' });
previewProduct.belongsTo(product, { foreignKey: 'productId' });

// Product - Payments
product.hasMany(payments, { foreignKey: 'productId' });
payments.belongsTo(product, { foreignKey: 'productId' });

// Product - Cart
product.hasMany(cart, { foreignKey: 'productId' });
cart.belongsTo(product, { foreignKey: 'productId' });

// Category - Product
category.hasMany(product, { foreignKey: 'categoryId' });
product.belongsTo(category, { foreignKey: 'categoryId' });

const sync = async () => {
    await User.sync();
    await apikey.sync();
    await product.sync();
    await category.sync();
    await cart.sync();
    await payments.sync();
    await coupon.sync();
    await previewProduct.sync();
    await favouriteProduct.sync();
    await question.sync(); // Ensure the question model is synced with the database
    await otp.sync();
};

module.exports = sync;
