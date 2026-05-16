import Header from '../components/Header';
import Footer from '../components/Footer';
import { useState, useEffect } from 'react';
import {
    requestGetCart,
    requestGetProductById,
    requestCreateCart,
    requestUpdateCartQuantity,
    requestRemoveCartItem,
    requestUpdateInfoCart,
    requestCreatePayment,
    requestAddCouponToCart,
    requestGetProducts,
} from '../config/request';
import {
    Card,
    Button,
    InputNumber,
    Form,
    Input,
    Radio,
    Row,
    Col,
    Typography,
    Space,
    Divider,
    Empty,
    message,
    Modal,
    Spin,
    Badge,
    Steps,
} from 'antd';
import {
    ShoppingCartOutlined,
    DeleteOutlined,
    MinusOutlined,
    PlusOutlined,
    EnvironmentOutlined,
    TagOutlined,
    CreditCardOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';
import { useStore } from '../hooks/useStore';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

function CartUser() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState('vnpay');
    const [form] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [coupon, setCoupon] = useState([]);
    const [totalAmountAfterDiscount, setTotalAmountAfterDiscount] = useState(0);
    const [selectedCoupon, setSelectedCoupon] = useState(null);

    const { fetchCart } = useStore();

    const [dataNew, setDataNew] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await requestGetProducts();
            setDataNew(res.metadata);
        };
        fetchData();
    }, []);

    useEffect(() => {
        fetchCartUser();
    }, []);

    const fetchCartUser = async () => {
        try {
            setLoading(true);
            const res = await requestGetCart();
            setCartItems(res.metadata.cart || []);
            setCoupon(res.metadata.coupon || []);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching cart:', error);
            message.error('Không thể tải thông tin giỏ hàng');
            setLoading(false);
        }
    };

    useEffect(() => {
        setTotalAmountAfterDiscount(cartItems.reduce((acc, item) => acc + item.totalPrice, 0));
    }, [cartItems]);

    const handleQuantityChange = async (productId, newQuantity) => {
        try {
            if (newQuantity < 1) return;

            // Update quantity in the backend
            await requestUpdateCartQuantity({
                productId,
                quantity: newQuantity,
            });

            // Update local state
            const updatedCart = cartItems.map((item) => {
                if (item.productId === productId) {
                    return {
                        ...item,
                        quantity: newQuantity,
                        totalPrice: (item.totalPrice / item.quantity) * newQuantity,
                    };
                }
                return item;
            });

            setCartItems(updatedCart);
            message.success('Cập nhật số lượng thành công');
        } catch (error) {
            console.error('Error updating quantity:', error);
            message.error('Không thể cập nhật số lượng');
        }
    };

    const handleRemoveItem = async (productId) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?',
            okText: 'Xóa',
            cancelText: 'Hủy',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    await requestRemoveCartItem(productId);
                    // Update local state
                    const updatedCart = cartItems.filter((item) => item.productId !== productId);
                    setCartItems(updatedCart);
                    fetchCart();
                    message.success('Đã xóa sản phẩm khỏi giỏ hàng');
                } catch (error) {
                    console.error('Error removing item:', error);
                    message.error('Không thể xóa sản phẩm');
                }
            },
        });
    };

    const navigate = useNavigate();

    const handleApplyCoupon = async (couponId) => {
        if (couponId === selectedCoupon) {
            toast.error('Mã giảm giá đã được áp dụng');
            return;
        }
        const findCoupon = coupon.find((item) => item.id === couponId);
        const totalAmount = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
        if (findCoupon) {
            setTotalAmountAfterDiscount(totalAmount - (findCoupon.discount / 100) * totalAmount);
            setSelectedCoupon(couponId);
            toast.success('Áp dụng mã giảm giá thành công');
        }
        try {
            await requestAddCouponToCart(couponId);
        } catch (error) {
            toast.error('Không thể áp dụng mã giảm giá');
        }
    };

    const handleCheckout = async (values) => {
        try {
            setCurrentStep(1);
            // Update cart items with shipping information
            await requestUpdateInfoCart({
                fullName: values.fullName,
                phoneNumber: values.phoneNumber,
                address: values.address,
            });

            // In a real app, this would proceed to payment gateway
            setCurrentStep(2);
            if (paymentMethod === 'vnpay') {
                const res = await requestCreatePayment({ typePayment: paymentMethod });
                window.open(res.metadata, '_blank');
            } else if (paymentMethod === 'momo') {
                const res = await requestCreatePayment({ typePayment: paymentMethod });
                window.open(res.metadata.payUrl, '_blank');
            } else {
                const res = await requestCreatePayment({ typePayment: paymentMethod });
                navigate(`/payment-success/${res.metadata[0].idPayment}`);
                console.log(res.metadata);
            }
        } catch (error) {
            message.error(error.response.data.message);
        }
    };

    const handleAddToCart = async (productId) => {
        try {
            await requestCreateCart({
                productId,
                quantity: 1,
            });
            toast.success('Thêm vào giỏ hàng thành công');
            fetchCartUser();
        } catch (error) {
            toast.error('Lỗi !!!');
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const renderCartItem = (item) => {
        return (
            <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 mb-4 transition-all hover:shadow-md">
                <div className="flex flex-col md:flex-row">
                    <div className="flex items-start md:w-3/5">
                        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 mr-4 border border-gray-100">
                            <img
                                src={item.product.productImage}
                                alt={item.product.productName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = 'https://placehold.co/96x96?text=Food';
                                }}
                            />
                        </div>
                        <div className="flex-grow">
                            <Text strong className="text-lg mb-1 block">
                                {item.product.productName}
                            </Text>
                            <Text className="text-gray-500 block mb-2">
                                {formatPrice(item.totalPrice / item.quantity)}
                            </Text>
                            <Paragraph ellipsis={{ rows: 2 }} className="text-xs text-gray-400">
                                {item.product.productDescription}
                            </Paragraph>
                        </div>
                    </div>
                    <div className="md:w-2/5 flex flex-col md:flex-row md:items-center md:justify-end mt-4 md:mt-0">
                        <div className="flex items-center mb-3 md:mb-0 md:mr-6">
                            <div className="flex items-center bg-gray-50 rounded-full border overflow-hidden">
                                <Button
                                    icon={<MinusOutlined />}
                                    onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                    type="text"
                                    className="hover:text-blue-500 border-0"
                                />
                                <span className="px-4 font-medium">{item.quantity}</span>
                                <Button
                                    icon={<PlusOutlined />}
                                    onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                    type="text"
                                    className="hover:text-blue-500 border-0"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end w-full md:w-auto">
                            <Text strong className="text-lg md:mr-4">
                                {formatPrice(item.totalPrice)}
                            </Text>
                            <Button
                                danger
                                onClick={() => handleRemoveItem(item.productId)}
                                icon={<DeleteOutlined />}
                                type="text"
                                className="hover:bg-red-50 hover:text-red-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <header>
                <Header />
            </header>

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="mb-8">
                    <Steps
                        current={currentStep}
                        items={[
                            { title: 'Giỏ hàng', icon: <ShoppingCartOutlined /> },
                            { title: 'Đặt hàng', icon: <EnvironmentOutlined /> },
                            { title: 'Thanh toán', icon: <CreditCardOutlined /> },
                        ]}
                    />
                </div>

                <div className="mb-6 flex items-center justify-between">
                    <Title level={3} className="flex items-center m-0">
                        <ShoppingCartOutlined className="mr-2 text-blue-500" />
                        Giỏ hàng của bạn
                        {cartItems.length > 0 && (
                            <Badge
                                count={cartItems.length}
                                style={{ backgroundColor: '#108ee9', marginLeft: 10 }}
                                className="ml-2"
                            />
                        )}
                    </Title>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-16">
                        <Spin size="large" />
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                        <Empty
                            description={
                                <div>
                                    <p className="text-lg font-medium mb-1">Giỏ hàng trống</p>
                                    <p className="text-gray-500">Hãy thêm món ăn vào giỏ hàng của bạn!</p>
                                </div>
                            }
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            className="my-8"
                        />
                        <Button type="primary" size="large" href="/" className="bg-blue-500">
                            Tiếp tục mua sắm
                        </Button>
                    </div>
                ) : (
                    <Row gutter={[24, 24]} className="mb-8">
                        <Col xs={24} lg={16} className="mb-6 lg:mb-0">
                            <div>{cartItems.map((item) => renderCartItem(item))}</div>
                            <div className="mt-8">
                                <h2 className="text-xl font-semibold mb-4 flex items-center">
                                    <span className="w-2 h-6 bg-blue-500 rounded-sm mr-2 inline-block"></span>
                                    Sản phẩm liên quan
                                </h2>
                                <div className="overflow-x-auto pb-4">
                                    <div className="flex space-x-4" style={{ minWidth: 'min-content' }}>
                                        {dataNew.products
                                            .filter(
                                                (item) => !cartItems.some((cartItem) => cartItem.productId === item.id),
                                            )
                                            .map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="bg-white rounded-lg shadow-sm p-4 flex items-center w-[350px] flex-shrink-0 hover:shadow-md transition-shadow"
                                                >
                                                    <div className="w-24 h-24 mr-4 rounded-lg overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={item.productImage}
                                                            alt={item.productName}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.src = 'https://placehold.co/96x96?text=Food';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-base mb-1 truncate">
                                                            {item.productName}
                                                        </h3>
                                                        <p className="text-blue-600 font-semibold mb-2">
                                                            {formatPrice(item.productPrice)}
                                                        </p>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center">
                                                                <Button
                                                                    size="middle"
                                                                    type="primary"
                                                                    icon={<ShoppingCartOutlined />}
                                                                    onClick={() => handleAddToCart(item.id)}
                                                                    className="bg-blue-500"
                                                                >
                                                                    Thêm
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </Col>

                        <Col xs={24} lg={8}>
                            <div className="sticky top-6">
                                <Card
                                    title={
                                        <div className="flex items-center">
                                            <TagOutlined className="mr-2 text-blue-500" />
                                            <span>Mã giảm giá</span>
                                        </div>
                                    }
                                    className="mb-6 shadow-sm rounded-lg"
                                    bodyStyle={{ padding: '16px' }}
                                >
                                    <div className="grid grid-cols-2 gap-2">
                                        {coupon.map((item) => (
                                            <Button
                                                type={selectedCoupon === item.id ? 'primary' : 'default'}
                                                key={item.id}
                                                className="w-full"
                                                onClick={() => handleApplyCoupon(item.id)}
                                            >
                                                {item.nameCoupon} - giảm {item.discount}%
                                            </Button>
                                        ))}
                                    </div>
                                </Card>

                                <Card
                                    title={
                                        <div className="flex items-center">
                                            <EnvironmentOutlined className="mr-2 text-blue-500" />
                                            <span>Thông tin đặt hàng</span>
                                        </div>
                                    }
                                    className="shadow-sm rounded-lg"
                                    bodyStyle={{ padding: '16px' }}
                                >
                                    <Form form={form} layout="vertical" onFinish={handleCheckout}>
                                        <Form.Item
                                            name="fullName"
                                            label="Họ và tên"
                                            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                                        >
                                            <Input placeholder="Nhập họ và tên người nhận" />
                                        </Form.Item>

                                        <Form.Item
                                            name="phoneNumber"
                                            label="Số điện thoại"
                                            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                                        >
                                            <Input placeholder="Nhập số điện thoại liên hệ" />
                                        </Form.Item>

                                        <Form.Item
                                            name="address"
                                            label="Địa chỉ giao hàng"
                                            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ giao hàng' }]}
                                        >
                                            <Input.TextArea placeholder="Nhập địa chỉ giao hàng" rows={3} />
                                        </Form.Item>

                                        <Divider className="my-4" />

                                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                            <div className="flex justify-between mb-2">
                                                <Text>Tạm tính:</Text>
                                                <Text>{formatPrice(totalAmountAfterDiscount)}</Text>
                                            </div>
                                            {selectedCoupon && (
                                                <div className="flex justify-between mb-2">
                                                    <Text className="flex items-center">
                                                        <TagOutlined className="mr-1 text-red-500" />
                                                        Giảm giá:
                                                    </Text>
                                                    <Text type="danger">
                                                        -
                                                        {formatPrice(
                                                            (coupon.find((item) => item.id === selectedCoupon)
                                                                .discount /
                                                                100) *
                                                                totalAmountAfterDiscount,
                                                        )}
                                                    </Text>
                                                </div>
                                            )}
                                            <Divider className="my-2" />
                                            <div className="flex justify-between items-center">
                                                <Text strong>Tổng cộng:</Text>
                                                <Text strong className="text-xl text-blue-600">
                                                    {formatPrice(totalAmountAfterDiscount)}
                                                </Text>
                                            </div>
                                        </div>

                                        <Form.Item
                                            name="paymentMethod"
                                            label="Phương thức thanh toán"
                                            initialValue="vnpay"
                                        >
                                            <Radio.Group
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                value={paymentMethod}
                                                className="w-full"
                                            >
                                                <Space direction="vertical" className="w-full">
                                                    <Radio value="vnpay">
                                                        <div className="flex items-center py-2 px-1">
                                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3 shadow-sm">
                                                                <img
                                                                    src="https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png"
                                                                    alt="VNPay"
                                                                    className="w-8 h-8"
                                                                />
                                                            </div>
                                                            <span>Thanh toán qua VNPay</span>
                                                        </div>
                                                    </Radio>
                                                    <Radio value="momo">
                                                        <div className="flex items-center py-2 px-1">
                                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3 shadow-sm">
                                                                <img
                                                                    src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"
                                                                    alt="MoMo"
                                                                    className="w-8 h-8"
                                                                />
                                                            </div>
                                                            <span>Thanh toán qua MoMo</span>
                                                        </div>
                                                    </Radio>
                                                    <Radio value="cod">
                                                        <div className="flex items-center py-2 px-1">
                                                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                                                                <CheckCircleOutlined className="text-blue-500 text-xl" />
                                                            </div>
                                                            <span>Thanh toán khi nhận hàng (COD)</span>
                                                        </div>
                                                    </Radio>
                                                </Space>
                                            </Radio.Group>
                                        </Form.Item>

                                        <Form.Item className="mb-0">
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                size="large"
                                                block
                                                className="h-12 bg-blue-500 text-lg"
                                            >
                                                Đặt hàng ngay
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </Card>
                            </div>
                        </Col>
                    </Row>
                )}
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default CartUser;
