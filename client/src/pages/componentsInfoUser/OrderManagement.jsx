import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Modal, Tabs, Badge, Descriptions, Timeline, Empty, Form, Rate, Input, Select } from 'antd';
import { requestCancelPayment, requestCreatePreview, requestGetPaymentsByUserId } from '../../config/request';
import { toast, ToastContainer } from 'react-toastify';

const { TextArea } = Input;
const { Option } = Select;

function OrderManagement() {
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [reviewForm] = Form.useForm();

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const res = await requestGetPaymentsByUserId();
            if (res && res.statusCode === 200 && res.metadata) {
                setOrders(res.metadata);
            }
        } catch (error) {
            console.error('Failed to fetch payments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setViewModalVisible(true);
    };

    const handleCancelOrder = async (order) => {
        try {
            await requestCancelPayment(order.idPayment);
            toast.success('Huỷ đơn hàng thành công');
            fetchPayments();
        } catch (error) {
            console.error('Failed to cancel order:', error);
        }
    };

    const handleOpenReviewModal = (order) => {
        setSelectedOrder(order);
        setSelectedProduct(order.items[0].product);
        setReviewModalVisible(true);
        reviewForm.resetFields();
    };

    const handleSubmitReview = async () => {
        try {
            setReviewLoading(true);
            const values = await reviewForm.validateFields();

            const data = {
                content: values.content,
                productId: values.productId,
                rating: values.rating,
            };
            const res = await requestCreatePreview(data);
            console.log(res);

            // Simulate API call
            setTimeout(() => {
                toast.success('Đánh giá đã được gửi thành công!');
                setReviewModalVisible(false);
                setReviewLoading(false);
            }, 500);
        } catch (error) {
            console.error('Failed to submit review:', error);
            setReviewLoading(false);
        }
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

    const getPaymentMethod = (type) => {
        switch (type) {
            case 'cod':
                return 'Thanh toán khi nhận hàng';
            case 'momo':
                return 'Ví điện tử MoMo';
            case 'vnpay':
                return 'VNPay';
            default:
                return type;
        }
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'idPayment',
            key: 'idPayment',
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => formatDate(date),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (total) => `${total?.toLocaleString()} VND`,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getStatusTag(status),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <div className="space-x-2">
                    <Button type="primary" size="small" onClick={() => handleViewOrder(record)}>
                        Xem chi tiết
                    </Button>
                    {record.status === 'pending' && (
                        <Button type="primary" danger size="small" onClick={() => handleCancelOrder(record)}>
                            Huỷ
                        </Button>
                    )}
                    {record.status === 'success' && (
                        <Button type="primary" size="small" onClick={() => handleOpenReviewModal(record)}>
                            Đánh giá
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    const getOrdersCount = (status) => {
        return orders.filter((order) => order.status === status).length;
    };

    const tabItems = [
        {
            key: 'all',
            label: 'Tất cả đơn hàng',
            children: <Table dataSource={orders} columns={columns} rowKey="id" loading={loading} />,
        },
        {
            key: 'pending',
            label: (
                <Badge count={getOrdersCount('pending')} size="small">
                    Chờ xác nhận
                </Badge>
            ),
            children: (
                <Table
                    dataSource={orders.filter((order) => order.status === 'pending')}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    locale={{ emptyText: <Empty description="Không có đơn hàng nào" /> }}
                />
            ),
        },
        {
            key: 'confirm',
            label: (
                <Badge count={getOrdersCount('confirm')} size="small">
                    Đã xác nhận
                </Badge>
            ),
            children: (
                <Table
                    dataSource={orders.filter((order) => order.status === 'confirm')}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    locale={{ emptyText: <Empty description="Không có đơn hàng nào" /> }}
                />
            ),
        },
        {
            key: 'shipping',
            label: (
                <Badge count={getOrdersCount('shipping')} size="small">
                    Đang giao hàng
                </Badge>
            ),
            children: (
                <Table
                    dataSource={orders.filter((order) => order.status === 'shipping')}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    locale={{ emptyText: <Empty description="Không có đơn hàng nào" /> }}
                />
            ),
        },
        {
            key: 'success',
            label: (
                <Badge count={getOrdersCount('success')} size="small">
                    Thành công
                </Badge>
            ),
            children: (
                <Table
                    dataSource={orders.filter((order) => order.status === 'success')}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    locale={{ emptyText: <Empty description="Không có đơn hàng nào" /> }}
                />
            ),
        },
        {
            key: 'failed',
            label: (
                <Badge count={getOrdersCount('failed')} size="small">
                    Thất bại
                </Badge>
            ),
            children: (
                <Table
                    dataSource={orders.filter((order) => order.status === 'failed')}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    locale={{ emptyText: <Empty description="Không có đơn hàng nào" /> }}
                />
            ),
        },
    ];

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-6">
                <h2 className="text-2xl font-bold">Quản lý đơn hàng</h2>
                <p className="text-gray-500">Xem và quản lý tất cả đơn hàng của bạn</p>
            </div>

            <Tabs defaultActiveKey="all" items={tabItems} />

            {selectedOrder && (
                <Modal
                    title={`Chi tiết đơn hàng #${selectedOrder.idPayment}`}
                    open={viewModalVisible}
                    onCancel={() => setViewModalVisible(false)}
                    footer={[
                        <Button key="back" onClick={() => setViewModalVisible(false)}>
                            Đóng
                        </Button>,
                    ]}
                    width={700}
                >
                    <div className="mb-4">
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Trạng thái">
                                {getStatusTag(selectedOrder.status)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày đặt hàng">
                                {formatDate(selectedOrder.createdAt)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ giao hàng">
                                {selectedOrder.address || 'Chưa cung cấp'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Người nhận">
                                {selectedOrder.fullName || 'Chưa cung cấp'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                {selectedOrder.phoneNumber || 'Chưa cung cấp'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phương thức thanh toán">
                                {getPaymentMethod(selectedOrder.typePayment)}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>

                    <h3 className="text-lg font-medium mb-3">Sản phẩm</h3>
                    <Table
                        dataSource={selectedOrder.items.map((item, index) => ({
                            id: index,
                            name: item.product?.productName || 'Sản phẩm',
                            price: item.price / item.quantity,
                            quantity: item.quantity,
                        }))}
                        pagination={false}
                        rowKey="id"
                        columns={[
                            { title: 'Sản phẩm', dataIndex: 'name' },
                            { title: 'Số lượng', dataIndex: 'quantity' },
                            {
                                title: 'Giá',
                                dataIndex: 'price',
                                render: (price) => `${price.toLocaleString()} VND`,
                            },
                            {
                                title: 'Thành tiền',
                                render: (_, record) => `${(record.price * record.quantity).toLocaleString()} VND`,
                            },
                        ]}
                        summary={() => (
                            <Table.Summary.Row>
                                <Table.Summary.Cell colSpan={3} className="text-right font-bold">
                                    Tổng cộng:
                                </Table.Summary.Cell>
                                <Table.Summary.Cell className="font-bold">
                                    {`${selectedOrder.totalPrice.toLocaleString()} VND`}
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        )}
                    />
                </Modal>
            )}

            {/* Review Modal */}
            {selectedOrder && (
                <Modal
                    title="Đánh giá sản phẩm"
                    open={reviewModalVisible}
                    onCancel={() => setReviewModalVisible(false)}
                    footer={[
                        <Button key="back" onClick={() => setReviewModalVisible(false)}>
                            Hủy
                        </Button>,
                        <Button key="submit" type="primary" loading={reviewLoading} onClick={handleSubmitReview}>
                            Gửi đánh giá
                        </Button>,
                    ]}
                >
                    <Form form={reviewForm} layout="vertical" className="mt-4">
                        <Form.Item
                            name="productId"
                            label="Chọn sản phẩm"
                            rules={[{ required: true, message: 'Vui lòng chọn sản phẩm!' }]}
                        >
                            <Select
                                placeholder="Chọn sản phẩm để đánh giá"
                                onChange={(value) => {
                                    const product = selectedOrder.items.find((item) => item.product?.id === value);
                                    setSelectedProduct(product);
                                }}
                            >
                                {selectedOrder.items.map((item) => (
                                    <Option key={item.product?.id} value={item.product?.id}>
                                        {item.product?.productName || 'Sản phẩm không xác định'}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {selectedProduct && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-md">
                                <div className="flex items-center">
                                    {selectedProduct.product?.productImage && (
                                        <img
                                            src={selectedProduct.product.productImage}
                                            alt={selectedProduct.product.productName}
                                            className="w-16 h-16 object-cover rounded-md mr-3"
                                        />
                                    )}
                                    <div>
                                        <h4 className="font-medium">{selectedProduct.product?.productName}</h4>
                                        <p className="text-sm text-gray-500">
                                            {selectedProduct.quantity} x{' '}
                                            {(selectedProduct.price / selectedProduct.quantity).toLocaleString()} VND
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Form.Item
                            name="rating"
                            label="Đánh giá"
                            rules={[{ required: true, message: 'Vui lòng đánh giá sản phẩm!' }]}
                        >
                            <Rate allowHalf />
                        </Form.Item>

                        <Form.Item
                            name="content"
                            label="Nhận xét"
                            rules={[{ required: true, message: 'Vui lòng nhập nhận xét!' }]}
                        >
                            <TextArea
                                rows={4}
                                placeholder="Hãy chia sẻ trải nghiệm của bạn về sản phẩm này..."
                                maxLength={500}
                                showCount
                            />
                        </Form.Item>
                    </Form>
                </Modal>
            )}

            <ToastContainer />
        </div>
    );
}

export default OrderManagement;
