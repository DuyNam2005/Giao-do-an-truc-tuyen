import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Avatar, Upload, message } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import { useStore } from '../../hooks/useStore';
import { requestUpdateUser } from '../../config/request';

function PersonalInfo() {
    const [form] = Form.useForm();
    const { dataUser, fetchAuth } = useStore();
    const [dataUserDriver, setDataUserDriver] = useState({});
    const [loading, setLoading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');

    useEffect(() => {
        if (dataUser && dataUser.id) {
            setDataUserDriver(dataUser);
            setAvatarUrl(dataUser.avatar || '');
            // Cập nhật form với dữ liệu mới
            form.setFieldsValue(dataUser);
        }
    }, [dataUser, form]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const values = await form.validateFields();
            let urlImage;

            // Trường hợp avatar là object chứa fileList (tức là vừa upload ảnh mới)
            if (
                values.avatar &&
                typeof values.avatar === 'object' &&
                Array.isArray(values.avatar.fileList) &&
                values.avatar.fileList.length > 0 &&
                values.avatar.fileList[0].originFileObj
            ) {
                const formData = new FormData();
                formData.append('avatar', values.avatar.fileList[0].originFileObj);
                const dataImage = await requestUpdateUser(formData);
                urlImage = dataImage.secure_url;
            } else {
                // Trường hợp là đường dẫn URL string cũ
                urlImage = values.avatar;
            }

            const data = {
                fullName: values.fullName,
                email: values.email,
                phone: values.phone,
                address: values.address,
                avatar: urlImage,
            };

            await requestUpdateUser(data);
            fetchAuth();

            message.success('Thông tin đã được cập nhật');
            form.resetFields();
        } catch (error) {
            console.error('Validation failed:', error);
            message.error('Cập nhật thất bại, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Thông tin cá nhân</h2>

            <div className="flex flex-col md:flex-row items-start mb-8 gap-8">
                <div className="flex flex-col items-center">
                    <Avatar
                        size={120}
                        icon={<UserOutlined />}
                        src={avatarUrl || dataUserDriver.avatar}
                        className="mb-4"
                    />
                </div>

                <div className="flex-1 w-full">
                    <Form form={form} layout="vertical" initialValues={dataUserDriver} onFinish={handleSubmit}>
                        <Form.Item name="avatar" label="Ảnh đại diện" valuePropName="avatar">
                            <Upload listType="picture-card" maxCount={1} beforeUpload={() => false} accept="image/*">
                                <div>
                                    <UploadOutlined />
                                    <div style={{ marginTop: 8 }}>Tải lên</div>
                                </div>
                            </Upload>
                        </Form.Item>
                        <Form.Item
                            name="fullName"
                            label="Họ và tên"
                            rules={[
                                { required: true, message: 'Vui lòng nhập họ và tên!' },
                                { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự!' },
                            ]}
                        >
                            <Input placeholder="Nhập họ và tên" />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' },
                            ]}
                        >
                            <Input placeholder="Nhập email" />
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            label="Số điện thoại"
                            rules={[
                                { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại phải có 10-11 chữ số!' },
                            ]}
                        >
                            <Input placeholder="Nhập số điện thoại" />
                        </Form.Item>

                        <Form.Item
                            name="address"
                            label="Địa chỉ"
                            rules={[
                                { required: true, message: 'Vui lòng nhập địa chỉ!' },
                                { min: 10, message: 'Địa chỉ phải có ít nhất 10 ký tự!' },
                            ]}
                        >
                            <Input.TextArea rows={3} placeholder="Nhập địa chỉ chi tiết" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
                                Cập nhật thông tin
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div>
    );
}

export default PersonalInfo;
