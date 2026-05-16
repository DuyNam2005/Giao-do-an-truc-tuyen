import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, Card, Row, Col, Tag, Empty, Spin } from 'antd';
import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    SearchOutlined,
    AppstoreOutlined,
    BarsOutlined,
} from '@ant-design/icons';
import {
    requestCreateCategory,
    requestDeleteCategory,
    requestGetCategories,
    requestUpdateCategory,
} from '../../config/request';
import { toast, ToastContainer } from 'react-toastify';

const CategoryManagement = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [viewMode, setViewMode] = useState('table');
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);

    // Mock data for categories
    const [categories, setCategories] = useState([]);

    const fetchCategories = async () => {
        const res = await requestGetCategories();
        setCategories(res.metadata);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const filteredCategories = categories.filter((category) =>
        category.categoryName.toLowerCase().includes(searchText.toLowerCase()),
    );

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 100,
            ellipsis: true,
        },
        {
            title: 'Tên danh mục',
            dataIndex: 'categoryName',
            key: 'categoryName',
            render: (name, record) => (
                <div>
                    <span className="font-medium">{name}</span>
                </div>
            ),
            sorter: (a, b) => a.categoryName.localeCompare(b.categoryName),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => formatDate(date),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm
                        title="Bạn có chắc muốn xóa danh mục này?"
                        description="Xóa danh mục sẽ ảnh hưởng đến các sản phẩm thuộc danh mục này."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Có"
                        cancelText="Không"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const handleAdd = () => {
        setEditingId(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingId(record.id);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            const data = {
                id,
            };
            await requestDeleteCategory(data);
            toast.success('Xóa danh mục thành công');
            fetchCategories();
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOk = async () => {
        try {
            form.validateFields().then(async (values) => {
                setLoading(true);
                if (editingId) {
                    // Update existing category
                    const data = {
                        id: editingId,
                        categoryName: values.categoryName,
                    };
                    await requestUpdateCategory(data);
                    toast.success('Cập nhật danh mục thành công');
                } else {
                    // Add new category
                    await requestCreateCategory(values);
                    toast.success('Thêm danh mục thành công');
                }
                setLoading(false);
                setIsModalVisible(false);
                fetchCategories();
            });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
            setIsModalVisible(false);
        }
    };

    const CategoryCard = ({ category }) => (
        <Card hoverable className="h-full" style={{ borderTop: `3px solid ${category.color}` }}>
            <div className="flex items-start mb-4">
                <div className="flex-grow">
                    <div className="flex justify-between">
                        <h3 className="text-lg font-medium m-0">{category.categoryName}</h3>
                    </div>
                </div>
            </div>
            <div className="flex justify-end space-x-2">
                <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(category)}>
                    Sửa
                </Button>
                <Popconfirm
                    title="Bạn có chắc muốn xóa danh mục này?"
                    description="Xóa danh mục sẽ ảnh hưởng đến các sản phẩm thuộc danh mục này."
                    onConfirm={() => handleDelete(category.id)}
                    okText="Có"
                    cancelText="Không"
                    okButtonProps={{ danger: true }}
                >
                    <Button danger icon={<DeleteOutlined />}>
                        Xóa
                    </Button>
                </Popconfirm>
            </div>
        </Card>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Thêm danh mục mới
                </Button>
            </div>

            <Card className="mb-6">
                <div className="flex flex-wrap gap-4 justify-between">
                    <Input
                        placeholder="Tìm kiếm danh mục..."
                        prefix={<SearchOutlined className="text-gray-400" />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="max-w-sm"
                    />
                    <div className="flex gap-2">
                        <Button
                            type={viewMode === 'table' ? 'primary' : 'default'}
                            icon={<BarsOutlined />}
                            onClick={() => setViewMode('table')}
                        >
                            Dạng bảng
                        </Button>
                        <Button
                            type={viewMode === 'grid' ? 'primary' : 'default'}
                            icon={<AppstoreOutlined />}
                            onClick={() => setViewMode('grid')}
                        >
                            Dạng lưới
                        </Button>
                    </div>
                </div>
            </Card>

            <Spin spinning={loading}>
                {filteredCategories.length === 0 ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không tìm thấy danh mục nào" />
                ) : viewMode === 'table' ? (
                    <Table
                        columns={columns}
                        dataSource={filteredCategories}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        className="bg-white rounded-lg shadow-sm"
                    />
                ) : (
                    <Row gutter={[16, 16]}>
                        {filteredCategories.map((category) => (
                            <Col xs={24} sm={12} md={8} lg={8} xl={6} key={category.id}>
                                <CategoryCard category={category} />
                            </Col>
                        ))}
                    </Row>
                )}
            </Spin>

            <Modal
                title={editingId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
                confirmLoading={loading}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        name="categoryName"
                        label="Tên danh mục"
                        rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoryManagement;
