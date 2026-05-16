import React from 'react';
import { Modal, Button, Tag, Descriptions, Badge } from 'antd';
import { BellOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { requestUpdateStatus } from '../../config/request';
import { toast } from 'react-toastify';

function NewOrder({ data, isModalOpen, setIsModalOpen }) {
    if (!data || data.length === 0) return null;

    const order = data[0];

    const showModal = () => setIsModalOpen(true);
    const handleOk = () => setIsModalOpen(false);
    const handleCancel = () => setIsModalOpen(false);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN');
    };

    const formatPrice = (price) => {
        if (!price) return '0 VNĐ';
        return price.toLocaleString('vi-VN') + ' VNĐ';
    };

    const handleUpdateStatus = async (order) => {
        const data = {
            idPayment: order.idPayment,
            status: 'confirm',
        };
        await requestUpdateStatus(data);
        toast.success('Cập nhật trạng thái đơn hàng thành công');
        setIsModalOpen(false);
    };

    return (
        <>
            <Button
                type="primary"
                onClick={showModal}
                className="flex items-center bg-blue-500 hover:bg-blue-600"
                icon={<BellOutlined />}
            >
                Đơn hàng mới
            </Button>

            <Modal
                title={
                    <div className="flex items-center text-xl font-bold text-blue-600">
                        <ShoppingCartOutlined className="mr-2 text-2xl" />
                        Thông báo đơn hàng mới
                    </div>
                }
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                width={700}
                footer={[
                    <Button key="back" onClick={handleCancel}>
                        Đóng
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={() => handleUpdateStatus(order)}
                        className="bg-blue-500 hover:bg-blue-600"
                    >
                        Xác nhận
                    </Button>,
                ]}
            >
                <div className="p-4 bg-gray-50 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Mã đơn hàng: {order?.idPayment}</h3>
                        <Tag color={order?.status === 'pending' ? 'gold' : 'green'}>
                            {order?.status === 'pending' ? 'Chờ xử lý' : 'Đã xử lý'}
                        </Tag>
                    </div>

                    <Descriptions bordered column={1} size="small" className="bg-white rounded">
                        <Descriptions.Item label="Thời gian đặt hàng">{formatDate(order?.createdAt)}</Descriptions.Item>
                        <Descriptions.Item label="Phương thức thanh toán">
                            <Badge
                                status="processing"
                                text={order?.typePayment === 'cod' ? 'Thanh toán khi nhận hàng' : 'Thanh toán online'}
                            />
                        </Descriptions.Item>
                        <Descriptions.Item label="Mã giảm giá">{order?.nameCounpon || 'Không có'}</Descriptions.Item>
                    </Descriptions>

                    <div className="mt-4 border-t pt-4">
                        <h4 className="font-medium mb-2">Thông tin khách hàng</h4>
                        <Descriptions bordered column={1} size="small" className="bg-white rounded">
                            <Descriptions.Item label="Họ và tên">{order?.user?.fullName}</Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">{order?.phoneNumber}</Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ">{order?.address}</Descriptions.Item>
                        </Descriptions>
                    </div>

                    <div className="mt-4 border-t pt-4">
                        <h4 className="font-medium mb-2">Thông tin sản phẩm</h4>
                        <div className="bg-white p-3 rounded border space-y-4">
                            {data.map((item, index) => (
                                <div className="flex items-center" key={item?.product?.id || index}>
                                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center mr-3">
                                        <img
                                            src={item.product.productImage}
                                            alt={item.product.productName}
                                            className="w-16 h-16 object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="font-medium">{item.product.productName}</h5>
                                        <p className="text-gray-500 text-sm">{item.product.productDescription}</p>
                                        <div className="flex justify-between mt-1">
                                            <span>SL: {item.quantity}</span>
                                            <span className="font-semibold text-red-500">
                                                {formatPrice(item.product.productPrice)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 border-t pt-4 flex justify-between items-center">
                        <span className="font-semibold">Tổng tiền:</span>
                        <span className="text-xl font-bold text-red-600">
                            {formatPrice(
                                data.reduce((acc, item) => acc + item.product.productPrice * item.quantity, 0),
                            )}
                        </span>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default NewOrder;
