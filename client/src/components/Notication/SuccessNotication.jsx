import { Modal, Typography, Button, Result } from 'antd';
import { CheckCircleOutlined, ShoppingOutlined, HomeOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

function SuccessNotication({ isOpen, onClose, orderData, dataPayment }) {
    // Mock data for preview purposes
    const mockOrderData = {
        id: 'ORD-12345678',
        totalAmount: '350,000₫',
        deliveryAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
        items: [
            { name: 'Cơm gà xối mỡ', quantity: 2, price: '75,000₫' },
            { name: 'Canh chua cá lóc', quantity: 1, price: '120,000₫' },
            { name: 'Nước ngọt', quantity: 2, price: '40,000₫' },
        ],
        deliveryTime: '30 phút',
    };

    const data = orderData || mockOrderData;

    return (
        <Modal
            title={null}
            open={isOpen}
            onCancel={onClose}
            footer={null}
            centered
            width={400}
            className="success-notification-modal"
        >
            <div className="py-4">
                <Result
                    status="success"
                    title={<span className="text-xl font-medium text-green-600">Giao hàng thành công!</span>}
                    icon={<CheckCircleOutlined className="text-green-500 text-5xl" />}
                />

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex justify-between mb-2">
                        <Text strong className="text-gray-700">
                            Tổng tiền:
                        </Text>
                        <Text className="text-green-600 font-semibold">
                            {dataPayment?.totalPrice?.toLocaleString()}đ
                        </Text>
                    </div>
                    <div className="flex justify-between">
                        <Text strong className="text-gray-700">
                            Tên người nhận:
                        </Text>
                        <Text className="text-gray-800 text-right w-2/3">{dataPayment?.fullName}</Text>
                    </div>
                    <div className="flex justify-between">
                        <Text strong className="text-gray-700">
                            Số điện thoại:
                        </Text>
                        <Text className="text-gray-800 text-right w-2/3">{dataPayment?.phoneNumber}</Text>
                    </div>
                    <div className="flex justify-between">
                        <Text strong className="text-gray-700">
                            Địa chỉ giao hàng:
                        </Text>
                        <Text className="text-gray-800 text-right w-2/3">{dataPayment?.address}</Text>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-3 mb-4">
                    <Text strong className="text-gray-700 mb-2 block">
                        Các món đã giao:
                    </Text>
                    {orderData?.map((item, index) => (
                        <div key={index} className="flex justify-between mb-1">
                            <img src={item.product.productImage} className="w-10 h-10 rounded-full" />
                            <Text className="text-gray-600 pl-2">{item.product.productName}</Text>
                            <Text className="text-gray-800">{item.product.productPrice.toLocaleString()}đ</Text>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-2 mt-6">
                    <Button
                        type="primary"
                        className="w-full bg-green-500 hover:bg-green-600"
                        icon={<ShoppingOutlined />}
                        onClick={onClose}
                    >
                        Tiếp tục mua sắm
                    </Button>
                    <Button type="default" className="w-full" icon={<HomeOutlined />} onClick={onClose}>
                        Về trang chủ
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

export default SuccessNotication;
