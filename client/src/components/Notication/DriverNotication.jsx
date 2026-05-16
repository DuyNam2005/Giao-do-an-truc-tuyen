import { Modal, Avatar, Button, Divider, Typography, Space, Row, Col } from 'antd';
import { PhoneOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

function DriverNotication({ isOpen, onClose, driver }) {
    // Mock data for preview purposes
    const mockDriver = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        fullName: 'Nguyễn Văn Tài',
        phone: '0987654321',
        address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
        email: 'taixe@example.com',
        role: 'driver',
    };

    const driverData = driver || mockDriver;

    return (
        <Modal
            title={
                <div className="flex items-center">
                    <span className="text-lg font-medium text-green-600">Đã tìm thấy tài xế giao hàng</span>
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            footer={null}
            centered
            width={400}
            className="driver-notification-modal"
        >
            <div className="py-4">
                <div className="flex justify-center mb-6">
                    {driverData.avatar ? (
                        <Avatar src={driverData.avatar} size={100} className="border-4 border-green-500" />
                    ) : (
                        <Avatar size={100} className="bg-green-500 text-white text-2xl">
                            {driverData.fullName?.charAt(0) || 'T'}
                        </Avatar>
                    )}
                </div>

                <div className="space-y-3">
                    <div className="flex border-b border-gray-100 pb-2">
                        <Text className="w-1/3 font-semibold text-gray-600">Họ và tên:</Text>
                        <Text className="w-2/3 text-gray-800">{driverData.fullName}</Text>
                    </div>

                    <div className="flex border-b border-gray-100 pb-2">
                        <Text className="w-1/3 font-semibold text-gray-600">Số điện thoại:</Text>
                        <Text className="w-2/3 text-gray-800">{driverData.phone}</Text>
                    </div>

                    <div className="flex border-b border-gray-100 pb-2">
                        <Text className="w-1/3 font-semibold text-gray-600">Địa chỉ:</Text>
                        <Text className="w-2/3 text-gray-800">{driverData.address}</Text>
                    </div>

                    <div className="flex border-b border-gray-100 pb-2">
                        <Text className="w-1/3 font-semibold text-gray-600">Email:</Text>
                        <Text className="w-2/3 text-gray-800">{driverData.email}</Text>
                    </div>
                </div>

                <Col span={24}>
                    <Button
                        type="primary"
                        className="w-full bg-green-500 hover:bg-green-600"
                        icon={<CheckCircleOutlined />}
                        onClick={onClose}
                    >
                        Xác nhận
                    </Button>
                </Col>
            </div>
        </Modal>
    );
}

export default DriverNotication;
