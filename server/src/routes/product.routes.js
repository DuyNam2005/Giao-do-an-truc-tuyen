const express = require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads/product');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

var upload = multer({ storage: storage });

const controllerProduct = require('../controllers/product.controller');

router.post('/upload-image', upload.single('image'), controllerProduct.uploadImage);
router.post('/create', controllerProduct.createProduct);
router.get('/get-products', controllerProduct.getProducts);
router.get('/products-by-category', controllerProduct.getProductByCategory);
router.get('/get-product-by-id', controllerProduct.getProductById);
router.post('/update-product', controllerProduct.updateProduct);
router.post('/delete-product', controllerProduct.deleteProduct);

router.get('/get-all-product-admin', controllerProduct.getAllProductAdmin);
router.get('/search-product', controllerProduct.searchProduct);

module.exports = router;
