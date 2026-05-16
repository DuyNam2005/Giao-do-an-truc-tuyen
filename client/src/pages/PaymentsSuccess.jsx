import Header from '../components/Header';
import Footer from '../components/Footer';
import { useParams, Link } from 'react-router-dom';
import { requestGetPaymentById } from '../config/request';
import { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Card,
    Typography,
    Tag,
    Divider,
    List,
    Avatar,
    Space,
    Button,
    Descriptions,
    Result,
    Spin,
    Empty,
    Badge,
} from 'antd';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    ShoppingOutlined,
    HomeOutlined,
    PhoneOutlined,
    UserOutlined,
    CreditCardOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

function PaymentsSuccess() {
    const { id } = useParams();
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayment = async () => {
            try {
                setLoading(true);
                const res = await requestGetPaymentById(id);
                setPayment(res.metadata);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching payment:', error);
                setLoading(false);
            }
        };
        fetchPayment();
    }, [id]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'success';
            case 'pending':
                return 'warning';
            case 'cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircleOutlined />;
            case 'pending':
                return <ClockCircleOutlined />;
            default:
                return null;
        }
    };

    const calculateTotal = (items) => {
        const total = items.reduce((sum, item) => sum + item.totalPrice, 0);
        return items[0]?.coupon ? total - (total * items[0].coupon.discount) / 100 : total;
    };

    const renderPaymentInfo = () => {
        if (!payment || payment.length === 0) return null;

        const firstItem = payment[0];
        const totalAmount = calculateTotal(payment);
        const hasCustomerInfo = payment.some((item) => item.fullName && item.address && item.phoneNumber);
        const customerInfo = payment.find((item) => item.fullName && item.address && item.phoneNumber) || {};

        return (
            <div className="max-w-4xl mx-auto">
                <Result
                    status="success"
                    title={
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 mb-2">Đặt hàng thành công!</div>
                            <div className="text-base text-gray-500">Mã đơn hàng: {firstItem.idPayment}</div>
                        </div>
                    }
                    subTitle={
                        <div className="text-center mt-2">
                            <Tag icon={getStatusIcon(firstItem.status)} color={getStatusColor(firstItem.status)}>
                                {firstItem.status === 'pending'
                                    ? 'Đang xử lý'
                                    : firstItem.status === 'completed'
                                    ? 'Hoàn tất'
                                    : 'Đã hủy'}
                            </Tag>
                        </div>
                    }
                />

                <div className="mt-6">
                    <Card className="mb-6 shadow-sm">
                        <Title level={4} className="mb-4 flex items-center">
                            <ShoppingOutlined className="mr-2 text-blue-500" />
                            Chi tiết đơn hàng
                        </Title>

                        <List
                            itemLayout="horizontal"
                            dataSource={payment}
                            renderItem={(item) => {
                                const product = item.product || {};
                                return (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar
                                                    shape="square"
                                                    size={64}
                                                    src={product.productImage}
                                                    className="rounded-md"
                                                />
                                            }
                                            title={
                                                <div className="flex justify-between items-start">
                                                    <Text strong>{product.productName}</Text>
                                                    <Text strong>{formatPrice(item.totalPrice)}</Text>
                                                </div>
                                            }
                                            description={
                                                <div>
                                                    <div className="text-gray-500">
                                                        {formatPrice(item.totalPrice / item.quantity)} x {item.quantity}
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        {product.productDescription?.substring(0, 100)}
                                                        {product.productDescription?.length > 100 ? '...' : ''}
                                                    </div>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                );
                            }}
                        />

                        <Divider className="my-4" />

                        <div className="flex justify-between items-center text-lg">
                            <Text strong>Tổng cộng:</Text>
                            <Text strong className="text-xl text-blue-600">
                                {formatPrice(totalAmount)}
                            </Text>
                        </div>
                    </Card>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Card className="mb-6 md:mb-0 shadow-sm h-full">
                                <Title level={4} className="mb-4 flex items-center">
                                    <UserOutlined className="mr-2 text-blue-500" />
                                    Thông tin khách hàng
                                </Title>

                                {hasCustomerInfo ? (
                                    <Descriptions column={1}>
                                        <Descriptions.Item
                                            label={
                                                <div className="flex items-center">
                                                    <UserOutlined className="mr-2" />
                                                    Họ tên
                                                </div>
                                            }
                                        >
                                            {customerInfo.fullName}
                                        </Descriptions.Item>
                                        <Descriptions.Item
                                            label={
                                                <div className="flex items-center">
                                                    <PhoneOutlined className="mr-2" />
                                                    Số điện thoại
                                                </div>
                                            }
                                        >
                                            {customerInfo.phoneNumber}
                                        </Descriptions.Item>
                                        <Descriptions.Item
                                            label={
                                                <div className="flex items-center">
                                                    <HomeOutlined className="mr-2" />
                                                    Địa chỉ
                                                </div>
                                            }
                                        >
                                            {customerInfo.address}
                                        </Descriptions.Item>
                                    </Descriptions>
                                ) : (
                                    <Empty description="Không có thông tin khách hàng" />
                                )}
                            </Card>
                        </Col>

                        <Col xs={24} md={12}>
                            <Card className="shadow-sm h-full">
                                <Title level={4} className="mb-4 flex items-center">
                                    <CreditCardOutlined className="mr-2 text-blue-500" />
                                    Thông tin thanh toán
                                </Title>

                                <Descriptions column={1}>
                                    <Descriptions.Item label="Phương thức">
                                        {firstItem.typePayment === 'momo' ? (
                                            <div className="flex items-center">
                                                <img
                                                    src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"
                                                    alt="MoMo"
                                                    className="w-6 h-6 mr-2"
                                                />
                                                <span>MoMo</span>
                                            </div>
                                        ) : firstItem.typePayment === 'vnpay' ? (
                                            <div className="flex items-center">
                                                <img
                                                    src="https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png"
                                                    alt="VNPay"
                                                    className="w-6 h-6 mr-2"
                                                />
                                                <span>VNPay</span>
                                            </div>
                                        ) : (
                                            <span>Thanh toán khi nhận hàng (COD)</span>
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Trạng thái">
                                        <Tag color={getStatusColor(firstItem.status)}>
                                            {firstItem.status === 'pending'
                                                ? 'Đang xử lý'
                                                : firstItem.status === 'completed'
                                                ? 'Hoàn tất'
                                                : 'Đã hủy'}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày đặt">
                                        {new Date(firstItem.createdAt).toLocaleString('vi-VN')}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </Col>
                    </Row>

                    <div className="mt-6 flex justify-center space-x-4">
                        <Button type="primary" size="large" className="bg-blue-500">
                            <Link to="/">Tiếp tục mua sắm</Link>
                        </Button>
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
                {loading ? (
                    <div className="flex justify-center items-center py-16">
                        <Spin size="large" tip="Đang tải thông tin đơn hàng..." />
                    </div>
                ) : payment ? (
                    renderPaymentInfo()
                ) : (
                    <Result
                        status="error"
                        title="Không tìm thấy đơn hàng"
                        subTitle="Đơn hàng không tồn tại hoặc đã bị hủy"
                        extra={
                            <Button type="primary" className="bg-blue-500">
                                <Link to="/">Trở về trang chủ</Link>
                            </Button>
                        }
                    />
                )}
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default PaymentsSuccess;
