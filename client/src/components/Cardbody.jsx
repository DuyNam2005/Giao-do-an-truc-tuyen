import { Button, Rate, InputNumber } from 'antd';
import { Link } from 'react-router-dom';
import { requestCreateCart } from '../config/request';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { useStore } from '../hooks/useStore';

function CardBody({ productImage, productName, productPrice, productSold, id, previewProducts, payments }) {
    const { fetchCart } = useStore();

    const [quantity, setQuantity] = useState(1);

    const handleQuantityChange = (value) => {
        setQuantity(Math.max(1, value));
    };

    const handleAddToCart = async () => {
        const data = {
            productId: id,
            quantity: quantity,
        };
        try {
            await requestCreateCart(data);
            toast.success('Thêm vào giỏ hàng thành công');
            fetchCart();
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    const averageRating = previewProducts.reduce((acc, review) => acc + review.rating, 0) / previewProducts.length;

    return (
        <div className="w-[250px] bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col">
            {/* Image */}
            <Link to={`/product/${id}`}>
                <img src={productImage} alt={productName} className="w-full h-[140px] object-cover rounded-t-xl" />
            </Link>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                <div className="font-semibold text-base mb-1">{productName}</div>
                <div className="flex items-center text-xs text-gray-500 mb-2 gap-1">
                    <Rate
                        allowHalf
                        disabled
                        defaultValue={averageRating}
                        count={1}
                        style={{ color: '#ffc107', fontSize: 16 }}
                    />
                    <span className="text-[#ffc107] font-medium">{averageRating || 0}</span>
                    <span className="mx-1">Đã bán {payments.length} sản phẩm</span>
                </div>
                <div className="text-[#ee4d2d] text-lg font-bold mb-3">{productPrice.toLocaleString()} đ</div>
                <div className="flex items-center justify-between mt-auto">
                    <InputNumber
                        min={1}
                        max={99}
                        defaultValue={1}
                        size="small"
                        className="!w-20"
                        onChange={handleQuantityChange}
                    />
                    <Button
                        type="primary"
                        className="!bg-[#ee4d2d] !rounded-lg !font-semibold !px-6 !h-9 hover:!bg-[#d84315] ml-2"
                        size="small"
                        onClick={handleAddToCart}
                    >
                        Thêm
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default CardBody;
