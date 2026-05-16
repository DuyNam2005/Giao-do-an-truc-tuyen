const category = require('../models/category.model');
const product = require('../models/product.model');

const { AuthFailureError, BadRequestError } = require('../core/error.response');
const { OK } = require('../core/success.response');

class CategoryController {
    async createCategory(req, res) {
        const { categoryName } = req.body;
        if (!categoryName) {
            throw new BadRequestError('Tên danh mục không được để trống');
        }
        const newCategory = await category.create({ categoryName });
        new OK({
            message: 'Tạo danh mục thành công',
            metadata: newCategory,
        }).send(res);
    }

    async getCategories(req, res) {
        const categories = await category.findAll();
        new OK({
            message: 'Lấy danh mục thành công',
            metadata: categories,
        }).send(res);
    }

    async updateCategory(req, res) {
        const { id, categoryName } = req.body;
        const categoryUpdate = await category.findOne({ where: { id } });
        if (!categoryUpdate) {
            throw new NotFoundError('Danh mục không tồn tại');
        }
        categoryUpdate.categoryName = categoryName;
        await categoryUpdate.save();
        new OK({
            message: 'Cập nhật danh mục thành công',
            metadata: categoryUpdate,
        }).send(res);
    }

    async deleteCategory(req, res) {
        const { id } = req.body;
        const categoryDelete = await category.findOne({ where: { id } });
        if (!categoryDelete) {
            throw new NotFoundError('Danh mục không tồn tại');
        }
        const products = await product.findAll({ where: { categoryId: id } });
        products.forEach(async (product) => {
            await product.destroy();
        });
        await categoryDelete.destroy();
        new OK({
            message: 'Xóa danh mục thành công',
            metadata: categoryDelete,
        }).send(res);
    }
}

module.exports = new CategoryController();
