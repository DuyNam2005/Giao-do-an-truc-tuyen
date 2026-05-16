import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Modal, Descriptions, DatePicker, Space, Tabs, message } from 'antd';
import { PhoneOutlined, EnvironmentOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { requestAddDriver, requestGetPaymentsAdmin, requestUpdateStatus } from '../../config/request';

function OrderManagement() {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [activeTab, setActiveTab] = useState('confirm');
    const [orders, setOrders] = useState([]);

    const { RangePicker } = DatePicker;
    const [dateRange, setDateRange] = useState([dayjs().subtract(7, 'day'), dayjs()]);

    const fetchOrders = async () => {
        const res = await requestGetPaymentsAdmin();
        setOrders(res.metadata);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleAddDriver = async (order) => {
        const data = {
            idPayment: order.idPayment,
        };
        try {
            await requestAddDriver(data);
            message.success('Thêm tài xế thành công');
            fetchOrders();
        } catch (error) {
            message.error('Thêm tài xế thất bại');
        }
    };

    const handleCompleteOrder = async (order) => {
        const data = {
            idPayment: order.idPayment,
            status: 'success',
        };
        try {
            await requestUpdateStatus(data);
            message.success('Hoàn thành đơn hàng thành công');
            fetchOrders();
        } catch (error) {
            message.error('Hoàn thành đơn hàng thất bại');
        }
    };

    const showOrderDetails = (order) => {
        setSelectedOrder(order);
        setModalVisible(true);
    };

    const statusColors = {
        pending: 'orange',
        confirm: 'blue',
        shipping: 'cyan',
        success: 'green',
        failed: 'red',
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'idPayment',
            key: 'idPayment',
            render: (text) => <span className="font-medium">{text}</span>,
        },
        {
            title: 'Khách hàng',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            ellipsis: true,
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (text) => (
                <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(text)}</span>
            ),
        },
        {
            title: 'Phương thức',
            dataIndex: 'typePayment',
            key: 'typePayment',
            render: (text) => {
                const methods = {
                    cod: 'Tiền mặt',
                    momo: 'MoMo',
                    vnpay: 'VNPay',
                };
                return methods[text] || text;
            },
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => dayjs(text).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={statusColors[status]}>
                    {status === 'pending' && 'Chờ xác nhận'}
                    {status === 'confirm' && 'Đã xác nhận'}
                    {status === 'shipping' && 'Đang giao hàng'}
                    {status === 'success' && 'Giao hàng thành công'}
                    {status === 'failed' && 'Giao hàng thất bại'}
                </Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    {record.status === 'confirm' && (
                        <Button type="primary" size="small" onClick={() => handleAddDriver(record)}>
                            Nhận đơn
                        </Button>
                    )}
                    {record.status === 'shipping' && (
                        <div className="flex flex-col gap-2">
                            <Button
                                type="primary"
                                size="small"
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleCompleteOrder(record)}
                            >
                                Hoàn thành
                            </Button>
                            <Button danger size="small" icon={<CloseCircleOutlined />}>
                                Hủy đơn
                            </Button>
                        </div>
                    )}
                    <Button type="default" size="small" onClick={() => showOrderDetails(record)}>
                        Chi tiết
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Quản lý đơn hàng</h2>
                <div className="flex items-center gap-4">
                    <RangePicker value={dateRange} onChange={(dates) => setDateRange(dates)} />
                    <Button type="primary">Làm mới</Button>
                </div>
            </div>

            <Table columns={columns} dataSource={orders} rowKey="id" pagination={{ pageSize: 10 }} />

            <Modal
                title="Chi tiết đơn hàng"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setModalVisible(false)}>
                        Đóng
                    </Button>,
                    selectedOrder?.status === 'confirm' && (
                        <Button key="accept" type="primary" onClick={() => setModalVisible(false)}>
                            Nhận đơn hàng
                        </Button>
                    ),
                    selectedOrder?.status === 'shipping' && (
                        <Button key="complete" type="primary" onClick={() => handleCompleteOrder(selectedOrder)}>
                            Hoàn thành đơn hàng
                        </Button>
                    ),
                ]}
                width={700}
            >
                {selectedOrder && (
                    <div className="mt-4">
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Mã đơn hàng">{selectedOrder.idPayment}</Descriptions.Item>
                            <Descriptions.Item label="Khách hàng">{selectedOrder.fullName}</Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                <a href={`tel:${selectedOrder.phoneNumber}`}>
                                    <PhoneOutlined className="mr-2" />
                                    {selectedOrder.phoneNumber}
                                </a>
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ giao hàng">
                                <EnvironmentOutlined className="mr-2" />
                                {selectedOrder.address}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng tiền">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                    selectedOrder.totalPrice,
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phương thức thanh toán">
                                {selectedOrder.typePayment === 'cod' && 'Thanh toán khi nhận hàng (COD)'}
                                {selectedOrder.typePayment === 'momo' && 'Ví MoMo'}
                                {selectedOrder.typePayment === 'vnpay' && 'VNPay'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời gian đặt hàng">
                                {dayjs(selectedOrder.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={statusColors[selectedOrder.status]}>
                                    {selectedOrder.status === 'pending' && 'Chờ xác nhận'}
                                    {selectedOrder.status === 'confirm' && 'Đã xác nhận'}
                                    {selectedOrder.status === 'shipping' && 'Đang giao hàng'}
                                    {selectedOrder.status === 'success' && 'Giao hàng thành công'}
                                    {selectedOrder.status === 'failed' && 'Giao hàng thất bại'}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default OrderManagement;
