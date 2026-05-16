import React, { useEffect, useState } from 'react';
import { Rate, Button, Avatar, Divider, Typography, Image, Statistic } from 'antd';
import { ShoppingCartOutlined, StarOutlined, MessageOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link, useParams } from 'react-router-dom';
import {
    requestAddFavouriteProduct,
    requestCreateCart,
    requestDeleteFavouriteProduct,
    requestGetProductById,
} from '../config/request';
import { toast, ToastContainer } from 'react-toastify';
import { useStore } from '../hooks/useStore';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;

function DetailProduct() {
    const [preview, setPreview] = useState([]);
    const [isFavourite, setIsFavourite] = useState(false);

    // State for quantity
    const [quantity, setQuantity] = useState(1);
    const { fetchCart, dataUser } = useStore();

    const { id } = useParams();

    const [product, setProduct] = useState();

    const fetchProduct = async () => {
        const res = await requestGetProductById(id);
        setProduct(res.metadata.product);
        setPreview(res.metadata.preview);
        setIsFavourite(res.metadata.isFavourite.some((item) => item.userId === dataUser.id));
        console.log(res.metadata.isFavourite.some((item) => item.userId === dataUser.id));
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

    // Calculate average rating
    const averageRating = preview.reduce((acc, review) => acc + review.rating, 0) / preview.length;

    const handleQuantityChange = (value) => {
        setQuantity(Math.max(1, value));
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const handleAddToCart = async () => {
        const data = {
            productId: product.id,
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

    const handleAddToFavourite = async () => {
        try {
            const data = {
                productId: product.id,
            };
            if (!isFavourite) {
                await requestAddFavouriteProduct(data);
                toast.success('Thêm sản phẩm vào yêu thích thành công');
                fetchProduct();
                return;
            } else {
                await requestDeleteFavouriteProduct(data);
                toast.error('Xóa sản phẩm khỏi yêu thích thành công');
                fetchProduct();
                return;
            }
        } catch (error) {
            toast.error(error.response.data.message || 'Lỗi khi thêm sản phẩm vào yêu thích');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <header>
                <Header />
            </header>

            <main className="flex-grow container mx-auto px-4 py-8">
                {/* Product Details Section */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        {/* Product Image */}
                        <div className="p-6 flex items-center justify-center bg-gray-50">
                            <Image
                                src={product?.productImage}
                                alt={product?.productName}
                                className="rounded-lg"
                                preview={true}
                                style={{ maxHeight: '400px', objectFit: 'cover' }}
                            />
                        </div>

                        {/* Product Info */}
                        <div className="p-8 flex flex-col space-y-6">
                            <h1 className="text-2xl font-bold">{product?.productName}</h1>
                            <div className="flex items-center">
                                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full">
                                    <Rate disabled allowHalf value={averageRating} className="text-sm" />
                                    <Text className="text-sm text-gray-500">({averageRating.toFixed(1)})</Text>
                                </div>
                                <Divider type="vertical" className="mx-4" />
                                <div className="flex items-center space-x-1">
                                    <MessageOutlined className="text-gray-400" />
                                    <Text className="text-sm text-gray-500">{preview.length} đánh giá</Text>
                                </div>
                            </div>

                            <Statistic
                                value={product?.productPrice}
                                formatter={(value) => (
                                    <span className="text-2xl font-bold text-red-600">{formatPrice(value)}</span>
                                )}
                            />

                            <Paragraph className="text-gray-600 text-base">{product?.productDescription}</Paragraph>

                            <Divider className="my-2" />

                            {/* Quantity selector */}
                            <div className="flex items-center space-x-4">
                                <Text strong className="text-gray-700">
                                    Số lượng:
                                </Text>
                                <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                                    <Button
                                        type="text"
                                        onClick={() => handleQuantityChange(quantity - 1)}
                                        disabled={quantity <= 1}
                                        className="h-9 border-0 border-r border-gray-300 rounded-none"
                                    >
                                        -
                                    </Button>
                                    <div className="w-12 h-9 flex items-center justify-center">{quantity}</div>
                                    <Button
                                        type="text"
                                        onClick={() => handleQuantityChange(quantity + 1)}
                                        className="h-9 border-0 border-l border-gray-300 rounded-none"
                                    >
                                        +
                                    </Button>
                                </div>
                            </div>
                            {dataUser && dataUser.id ? (
                                <div className="flex flex-wrap gap-4 pt-4">
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<ShoppingCartOutlined />}
                                        className="bg-blue-600 h-12 px-6 flex items-center rounded-full"
                                        onClick={handleAddToCart}
                                    >
                                        Thêm vào giỏ hàng
                                    </Button>

                                    <Button onClick={handleAddToFavourite} size="large">
                                        {isFavourite ? (
                                            <div>
                                                <DislikeOutlined className="text-red-500" />
                                                <span className="ml-2">Bỏ yêu thích</span>
                                            </div>
                                        ) : (
                                            <div>
                                                <LikeOutlined className="text-red-500" />
                                                <span className="ml-2">Yêu thích</span>
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            ) : (
                                <div>
                                    <Link to={'/login'}>
                                        <Button type="primary" className="w-full" size="lage">
                                            Đăng nhập để đặt hàng
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-12 bg-white rounded-xl shadow-md p-8">
                    <div className="flex items-center justify-between mb-6">
                        <Title level={3} className="flex items-center gap-2 m-0">
                            <StarOutlined className="text-yellow-500" /> Đánh giá từ khách hàng
                        </Title>
                        <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-50 rounded-full">
                            <Text strong className="text-lg">
                                {averageRating.toFixed(1)}
                            </Text>
                            <Rate disabled allowHalf value={averageRating} className="text-sm" />
                            <Text className="text-sm text-gray-500">({preview.length} đánh giá)</Text>
                        </div>
                    </div>

                    {/* Rating breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {[5, 4, 3, 2, 1].map((rating) => {
                            const count = preview.filter((r) => r.rating === rating).length;
                            const percentage = (count / preview.length) * 100;
                            return (
                                <div key={rating} className="flex items-center space-x-2 col-span-1 md:col-span-1">
                                    <Text>{rating} sao</Text>
                                    <div className="h-2 flex-grow bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-400 rounded-full"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <Text className="text-sm">{count}</Text>
                                </div>
                            );
                        })}
                    </div>

                    <Divider />

                    {/* Reviews list */}
                    <div className="space-y-6">
                        {preview.map((review) => (
                            <div key={review.id} className="border-b border-gray-100 pb-6 mb-6">
                                <div className="flex items-start">
                                    <Avatar
                                        src={review.user.avatar || 'https://xsgames.co/randomusers/avatar.php?g=male'}
                                        size={48}
                                    />
                                    <div className="ml-4 flex-grow">
                                        <div className="flex items-center justify-between">
                                            <Text strong className="text-lg">
                                                {review.user.fullName}
                                            </Text>
                                            <Text className="text-gray-500 text-sm">
                                                {dayjs(review.createdAt).format('DD/MM/YYYY')}
                                            </Text>
                                        </div>
                                        <Rate disabled defaultValue={review.rating} className="text-sm my-1" />
                                        <Paragraph className="my-3 text-gray-700">{review.content}</Paragraph>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <footer className="mt-12">
                <Footer />
            </footer>
        </div>
    );
}

export default DetailProduct;
