const modelProduct = require('../models/product.model');
const modelCoupon = require('../models/coupon.model');
const modelPreview = require('../models/previewProduct.model');
const modelUser = require('../models/users.model');
const modelPayments = require('../models/payments.model');
const modelFavouriteProduct = require('../models/favouriteProduct.model');

const { AuthFailureError, BadRequestError } = require('../core/error.response');
const { OK } = require('../core/success.response');

const cloudinary = require('../utils/configCloudDinary');
const fs = require('fs/promises');
const searchFoodGemini = require('../utils/searchAI');

function getPublicId(url) {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');

    if (uploadIndex === -1) {
        throw new Error('Invalid Cloudinary URL');
    }

    const pathParts = parts.slice(uploadIndex + 1);
    const pathWithoutVersion = pathParts[0].startsWith('v') ? pathParts.slice(1) : pathParts;
    const publicIdWithExt = pathWithoutVersion.join('/');
    const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));

    return publicId;
}

class ProductController {
    async uploadImage(req, res) {
        const file = req.file;
        const result = await cloudinary.uploader.upload(file.path);
        await fs.unlink(file.path);
        new OK({
            message: 'Upload ảnh thành công',
            metadata: result,
        }).send(res);
    }

    async createProduct(req, res) {
        const { productName, productImage, productPrice, productDescription, categoryId } = req.body;
        if (!productName || !productImage || !productPrice || !productDescription || !categoryId) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        const newProduct = await modelProduct.create({
            productName,
            productImage,
            productPrice,
            productDescription,
            categoryId,
        });
        new OK({
            message: 'Tạo sản phẩm thành công',
            metadata: newProduct,
        }).send(res);
    }

    async getProducts(req, res) {
        const page = parseInt(req.query.page) || 1; // Trang hiện tại
        const limit = parseInt(req.query.limit) || 10; // Số sản phẩm mỗi trang
        const offset = (page - 1) * limit;

        const { count, rows } = await modelProduct.findAndCountAll({
            limit,
            offset,
            order: [['createdAt', 'DESC']], // Sắp xếp mới nhất trước, có thể bỏ
        });
        new OK({
            message: 'Lấy sản phẩm thành công',
            metadata: {
                products: rows,
                total: count,
            },
        }).send(res);
    }

    async getProductByCategory(req, res) {
        const categoryId = req.query.categoryId;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const queryOptions = {
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: modelPreview,
                    as: 'previewProducts',
                    attributes: ['id', 'rating', 'content', 'userId', 'createdAt'],
                },
                {
                    model: modelPayments,
                    as: 'payments',
                    attributes: ['id', 'totalPrice', 'status', 'createdAt'],
                },
            ],
        };

        // Nếu lấy tất cả sản phẩm
        if (categoryId === 'all') {
            const { count, rows } = await modelProduct.findAndCountAll(queryOptions);
            return new OK({
                message: 'Lấy sản phẩm thành công',
                metadata: {
                    products: rows,
                    total: count,
                    currentPage: page,
                    totalPages: Math.ceil(count / limit),
                },
            }).send(res);
        }

        // Nếu lọc theo danh mục
        const { count, rows } = await modelProduct.findAndCountAll({
            ...queryOptions,
            where: { categoryId },
        });

        return new OK({
            message: 'Lấy sản phẩm thành công',
            metadata: {
                currentPage: page,
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                products: rows,
            },
        }).send(res);
    }

    async getProductById(req, res) {
        try {
            const productId = req.query.id;

            // Tìm sản phẩm theo ID
            const product = await modelProduct.findOne({ where: { id: productId } });
            if (!product) {
                return new NotFound({ message: 'Không tìm thấy sản phẩm' }).send(res);
            }
            const preview = await modelPreview.findAll({ where: { productId } });
            const findFavourite = await modelFavouriteProduct.findAll({ where: { productId } });

            const dataPreview = await Promise.all(
                preview.map(async (item) => {
                    const user = await modelUser.findOne({ where: { id: item.userId } });

                    return {
                        ...item.dataValues,
                        user,
                    };
                }),
            );
            return new OK({
                message: 'Lấy sản phẩm thành công',
                metadata: {
                    product,
                    preview: dataPreview,
                    isFavourite: findFavourite,
                },
            }).send(res);
        } catch (error) {
            console.error(error);
            return new InternalServerError({ message: 'Đã có lỗi xảy ra' }).send(res);
        }
    }
    async updateProduct(req, res) {
        const { productId, productName, productImage, productPrice, productDescription, categoryId } = req.body;
        const product = await modelProduct.findOne({ where: { id: productId } });
        if (productImage && productImage !== product.productImage) {
            const publicId = getPublicId(product.productImage);
            await cloudinary.uploader.destroy(publicId);
        }
        product.productName = productName;
        product.productImage = productImage;
        product.productPrice = productPrice;
        product.productDescription = productDescription;
        product.categoryId = categoryId;
        await product.save();
        new OK({
            message: 'Cập nhật sản phẩm thành công',
        }).send(res);
    }

    async deleteProduct(req, res) {
        const productId = req.query.id;
        const product = await modelProduct.findOne({ where: { id: productId } });
        const publicId = getPublicId(product.productImage);
        await cloudinary.uploader.destroy(publicId);
        await product.destroy();
        new OK({
            message: 'Xóa sản phẩm thành công',
        }).send(res);
    }

    async getAllProductAdmin(req, res) {
        const products = await modelProduct.findAll();
        new OK({
            message: 'Lấy tất cả sản phẩm thành công',
            metadata: products,
        }).send(res);
    }

    async searchProduct(req, res) {
        const { query } = req.query;
        const products = await searchFoodGemini(query);

        const dataProducts = await Promise.all(
            products.map(async (product) => {
                const productData = await modelProduct.findOne({ where: { id: product.id } });
                return productData;
            }),
        );

        new OK({
            message: 'Tìm kiếm sản phẩm thành công',
            metadata: dataProducts,
        }).send(res);
    }
}

module.exports = new ProductController();
