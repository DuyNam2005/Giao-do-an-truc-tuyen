const modelPreview = require('../models/previewProduct.model');
const modelProduct = require('../models/product.model');

const { AuthFailureError, BadRequestError } = require('../core/error.response');
const { OK } = require('../core/success.response');

class PreviewController {
    async createPreview(req, res) {
        const { id } = req.user;
        const { content, productId, rating } = req.body;
        if (!content || !productId || !rating) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        const findProduct = await modelProduct.findOne({ where: { id: productId } });
        if (!findProduct) {
            throw new NotFoundError('Sản phẩm không tồn tại');
        }
        const preview = await modelPreview.create({ content, productId, userId: id, rating });
        new OK({ message: 'Tạo đánh giá thành công', preview }).send(res);
    }

    async getPreviewByUser(req, res) {
        const { id } = req.user;
        const preview = await modelPreview.findAll({ where: { userId: id } });
        const data = await Promise.all(
            preview.map(async (item) => {
                const product = await modelProduct.findOne({ where: { id: item.productId } });
                return { ...item.dataValues, productName: product.productName, productImage: product.productImage };
            }),
        );
        new OK({ message: 'Lấy đánh giá thành công', metadata: data }).send(res);
    }

    async updatePreview(req, res) {
        const { id } = req.user;
        const { id: idPreview, content, productId, rating } = req.body;
        if (!content || !productId || !rating) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        const findProduct = await modelProduct.findOne({ where: { id: productId } });
        if (!findProduct) {
            throw new NotFoundError('Sản phẩm không tồn tại');
        }
        const preview = await modelPreview.findOne({ where: { id: idPreview, userId: id } });
        if (!preview) {
            throw new NotFoundError('Đánh giá không tồn tại');
        }
        preview.content = content;
        preview.productId = productId;
        preview.rating = rating;
        await preview.save();
        new OK({ message: 'Cập nhật đánh giá thành công' }).send(res);
    }

    async deletePreview(req, res) {
        const { id } = req.user;
        const { id: idPreview } = req.body;
        const preview = await modelPreview.findOne({ where: { id: idPreview, userId: id } });
        if (!preview) {
            throw new NotFoundError('Đánh giá không tồn tại');
        }
        await preview.destroy();
        new OK({ message: 'Xóa đánh giá thành công' }).send(res);
    }
}

module.exports = new PreviewController();
