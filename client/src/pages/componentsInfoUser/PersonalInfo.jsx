import React, { useState } from 'react';
import { Form, Input, Button, message, Card, Avatar, Upload } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import { useStore } from '../../hooks/useStore';
import { requestUpdateUser } from '../../config/request';

function PersonalInfo() {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const { dataUser } = useStore();

    const [form] = Form.useForm();

    const handleEdit = () => {
        form.setFieldsValue({
            ...dataUser,
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            const data = {
                fullName: form.getFieldValue('fullName'),
                phone: form.getFieldValue('phone'),
                address: form.getFieldValue('address'),
            };
            const res = await requestUpdateUser(data);
            console.log(res);
        } catch (error) {
            console.log(error);
        }
    };

    const handleUpload = async (info) => {
        const formData = new FormData();
        formData.append('avatar', info.file.originFileObj);
        try {
            setLoading(true);
            await requestUpdateUser(formData);
            setLoading(false);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Thông tin cá nhân</h2>
                {!isEditing && (
                    <Button type="primary" onClick={handleEdit}>
                        Chỉnh sửa
                    </Button>
                )}
            </div>

            {isEditing ? (
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        ...dataUser,
                    }}
                >
                    <div className="mb-6 flex flex-col items-center">
                        <Avatar size={100} src={dataUser.avatar} icon={<UserOutlined />} />
                        <Upload onChange={handleUpload} showUploadList={false}>
                            <Button className="mt-3" icon={<UploadOutlined />}>
                                Thay đổi ảnh đại diện
                            </Button>
                        </Upload>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            name="fullName"
                            label="Họ và tên"
                            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' },
                            ]}
                        >
                            <Input disabled />
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            label="Số điện thoại"
                            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                        >
                            <Input />
                        </Form.Item>
                    </div>

                    <Form.Item name="address" label="Địa chỉ">
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <Form.Item className="flex justify-end">
                        <Button onClick={handleCancel} className="mr-2">
                            Hủy
                        </Button>
                        <Button type="primary" onClick={handleSave} loading={loading}>
                            Lưu
                        </Button>
                    </Form.Item>
                </Form>
            ) : (
                <Card>
                    <div className="flex flex-col sm:flex-row gap-8 items-start">
                        <div className="flex flex-col items-center">
                            <Avatar size={100} src={dataUser.avatar} icon={<UserOutlined />} />
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-500 mb-1">Họ và tên</p>
                                <p className="font-medium">{dataUser.fullName}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Email</p>
                                <p className="font-medium">{dataUser.email}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Số điện thoại</p>
                                <p className="font-medium">{dataUser.phone}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-gray-500 mb-1">Địa chỉ</p>
                                <p className="font-medium">{dataUser.address}</p>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}

export default PersonalInfo;
