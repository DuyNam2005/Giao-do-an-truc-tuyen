import React, { useEffect, useState } from 'react';
import {
    Table,
    Tag,
    Button,
    Tabs,
    Badge,
    Timeline,
    Card,
    Input,
    DatePicker,
    Space,
    Spin,
    Empty,
    Drawer,
    Avatar,
    Divider,
    List,
    Typography,
    message,
} from 'antd';
import {
    ShoppingCartOutlined,
    UserOutlined,
    PhoneOutlined,
    HomeOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    CarOutlined,
    SearchOutlined,
    SyncOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import locale from 'antd/es/date-picker/locale/vi_VN';
import { requestGetPaymentsAdmin, requestUpdateStatus } from '../../config/request';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

dayjs.locale('vi');

const OrderManagement = () => {
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchText, setSearchText] = useState('');
    const [dateRange, setDateRange] = useState(null);

    const fetchPayments = async () => {
        const res = await requestGetPaymentsAdmin();
        setOrders(res.metadata);
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    // Mock data for orders
    const [orders, setOrders] = useState([]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusTag = (status) => {
        switch (status) {
            case 'pending':
                return <Tag color="orange">Chờ xác nhận</Tag>;
            case 'confirm':
                return <Tag color="blue">Đã xác nhận</Tag>;
            case 'shipping':
                return <Tag color="cyan">Đang giao hàng</Tag>;
            case 'success':
                return <Tag color="green">Thành công</Tag>;
            case 'failed':
                return <Tag color="red">Thất bại</Tag>;
            default:
                return <Tag>Không xác định</Tag>;
        }
    };

    const getPaymentMethodTag = (type) => {
        switch (type) {
            case 'cod':
                return <Tag color="volcano">Thanh toán khi nhận hàng</Tag>;
            case 'momo':
                return <Tag color="magenta">Ví MoMo</Tag>;
            case 'vnpay':
                return <Tag color="blue">VNPay</Tag>;
            default:
                return <Tag>Không xác định</Tag>;
        }
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setViewModalVisible(true);
    };

    const handleUpdateStatus = async (order) => {
        const data = {
            idPayment: order.idPayment,
            status: 'confirm',
        };
        await requestUpdateStatus(data);
        message.success('Cập nhật trạng thái đơn hàng thành công');
        fetchPayments();
    };

    const getOrdersCount = (status) => {
        return status === 'all' ? orders.length : orders.filter((order) => order.status === status).length;
    };

    const filteredOrders = orders.filter((order) => {
        const matchStatus = statusFilter === 'all' || order.status === statusFilter;
        const matchSearch =
            order.idPayment.toLowerCase().includes(searchText.toLowerCase()) ||
            order.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
            order.phoneNumber.includes(searchText);

        let matchDate = true;
        if (dateRange && dateRange[0] && dateRange[1]) {
            const orderDate = new Date(order.createdAt);
            const startDate = dateRange[0].startOf('day').toDate();
            const endDate = dateRange[1].endOf('day').toDate();
            matchDate = orderDate >= startDate && orderDate <= endDate;
        }

        return matchStatus && matchSearch && matchDate;
    });

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'idPayment',
            key: 'idPayment',
            width: 150,
        },
        {
            title: 'Khách hàng',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (_, record) => (
                <div>
                    <div>{record.fullName}</div>
                    <div className="text-gray-500">{record.phoneNumber}</div>
                </div>
            ),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (price) => `${price.toLocaleString()}đ`,
            sorter: (a, b) => a.totalPrice - b.totalPrice,
        },
        {
            title: 'Phương thức',
            dataIndex: 'typePayment',
            key: 'typePayment',
            render: (type) => getPaymentMethodTag(type),
            filters: [
                { text: 'COD', value: 'cod' },
                { text: 'MoMo', value: 'momo' },
                { text: 'VNPay', value: 'vnpay' },
            ],
            onFilter: (value, record) => record.typePayment === value,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getStatusTag(status),
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => formatDate(date),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button type="primary" size="small" onClick={() => handleViewOrder(record)}>
                        Chi tiết
                    </Button>
                    {record.status === 'pending' && (
                        <Button type="default" size="small" onClick={() => handleUpdateStatus(record)}>
                            Xác nhận đơn hàng
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    const tabItems = [
        {
            key: 'all',
            label: (
                <Badge count={getOrdersCount('all')} showZero>
                    Tất cả
                </Badge>
            ),
        },
        {
            key: 'pending',
            label: (
                <Badge count={getOrdersCount('pending')} showZero>
                    Chờ xác nhận
                </Badge>
            ),
        },
        {
            key: 'confirm',
            label: (
                <Badge count={getOrdersCount('confirm')} showZero>
                    Đã xác nhận
                </Badge>
            ),
        },
        {
            key: 'shipping',
            label: (
                <Badge count={getOrdersCount('shipping')} showZero>
                    Đang giao hàng
                </Badge>
            ),
        },
        {
            key: 'success',
            label: (
                <Badge count={getOrdersCount('success')} showZero>
                    Thành công
                </Badge>
            ),
        },
        {
            key: 'failed',
            label: (
                <Badge count={getOrdersCount('failed')} showZero>
                    Thất bại
                </Badge>
            ),
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
            </div>

            <Card className="mb-6">
                <div className="flex flex-wrap gap-4 justify-between">
                    <div className="flex flex-wrap gap-4">
                        <Input
                            placeholder="Tìm kiếm theo mã đơn, tên, SĐT..."
                            prefix={<SearchOutlined className="text-gray-400" />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="w-64"
                        />
                        <RangePicker locale={locale} onChange={(dates) => setDateRange(dates)} className="w-64" />
                    </div>
                    <Button
                        type="default"
                        icon={<SyncOutlined />}
                        onClick={() => {
                            setSearchText('');
                            setDateRange(null);
                            setStatusFilter('all');
                        }}
                    >
                        Đặt lại bộ lọc
                    </Button>
                </div>
            </Card>

            <Card>
                <Tabs activeKey={statusFilter} onChange={setStatusFilter} type="card" items={tabItems} />
                <Spin spinning={loading}>
                    {filteredOrders.length === 0 ? (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có đơn hàng nào" />
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={filteredOrders}
                            rowKey="idPayment"
                            pagination={{ pageSize: 10 }}
                        />
                    )}
                </Spin>
            </Card>

            {/* Chi tiết đơn hàng */}
            <Drawer
                title={<span className="text-lg font-bold">Chi tiết đơn hàng</span>}
                width={640}
                placement="right"
                onClose={() => setViewModalVisible(false)}
                open={viewModalVisible}
            >
                {selectedOrder && (
                    <Spin spinning={loading}>
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <Title level={4} className="m-0">
                                    Đơn hàng #{selectedOrder.idPayment}
                                </Title>
                                {getStatusTag(selectedOrder.status)}
                            </div>
                            <div className="text-gray-500">Ngày đặt: {formatDate(selectedOrder.createdAt)}</div>
                        </div>

                        <Card title="Thông tin khách hàng" className="mb-4">
                            <div className="flex items-center mb-3">
                                <Avatar icon={<UserOutlined />} className="mr-3" />
                                <div>
                                    <div className="font-medium">{selectedOrder.fullName}</div>
                                    <div className="text-gray-500">{selectedOrder.user?.email}</div>
                                </div>
                            </div>
                            <div className="flex items-center mb-3">
                                <PhoneOutlined className="mr-3 text-gray-500" />
                                <span>{selectedOrder.phoneNumber}</span>
                            </div>
                            <div className="flex items-start">
                                <HomeOutlined className="mr-3 text-gray-500 mt-1" />
                                <span>{selectedOrder.address}</span>
                            </div>
                            {selectedOrder.note && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                    <Text type="secondary">Ghi chú: {selectedOrder.note}</Text>
                                </div>
                            )}
                        </Card>

                        <Card title="Sản phẩm đã đặt" className="mb-4">
                            <List
                                itemLayout="horizontal"
                                dataSource={selectedOrder.items}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={<Avatar shape="square" size={64} src={item.product.productImage} />}
                                            title={item.product.productName}
                                            description={
                                                <div>
                                                    <div>
                                                        {item.price.toLocaleString()}đ x {item.quantity}
                                                    </div>
                                                    <div className="font-medium">
                                                        {(item.price * item.quantity).toLocaleString()}đ
                                                    </div>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                            <Divider />
                            <div className="flex justify-between">
                                <Text strong>Tổng tiền:</Text>
                                <Text strong className="text-red-500 text-lg">
                                    {selectedOrder.totalPrice.toLocaleString()}đ
                                </Text>
                            </div>
                            <div className="flex justify-between mt-2">
                                <Text>Phương thức thanh toán:</Text>
                                {getPaymentMethodTag(selectedOrder.typePayment)}
                            </div>
                        </Card>
                    </Spin>
                )}
            </Drawer>
        </div>
    );
};

export default OrderManagement;
