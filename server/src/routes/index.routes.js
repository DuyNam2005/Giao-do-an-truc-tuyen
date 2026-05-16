const usersRoutes = require('./users.routes');
const categoryRoutes = require('./category.routes');
const productRoutes = require('./product.routes');
const cartRoutes = require('./cart.routes');
const paymentsRoutes = require('./payments.routes');
const couponRoutes = require('./coupon.routes');
const previewRoutes = require('./preview.routes');
const favouriteProductRoutes = require('./favouriteProduct.routes');
const questionRoutes = require('../routes/question.routes');

function route(app) {
    app.use('/api/users', usersRoutes);
    app.use('/api/category', categoryRoutes);
    app.use('/api/product', productRoutes);
    app.use('/api/cart', cartRoutes);
    app.use('/api/payments', paymentsRoutes);
    app.use('/api/coupon', couponRoutes);
    app.use('/api/preview', previewRoutes);
    app.use('/api/favourite-product', favouriteProductRoutes);
    app.use('/api/question', questionRoutes);
}

module.exports = route;
