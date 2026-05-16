import React, { useEffect, useState } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    InputNumber,
    Upload,
    Space,
    Popconfirm,
    Image,
    Card,
    Row,
    Col,
    Tabs,
    Tag,
    Spin,
    Empty,
    Switch,
} from 'antd';
import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    SearchOutlined,
    EyeOutlined,
    AppstoreOutlined,
    BarsOutlined,
} from '@ant-design/icons';

import { useStore } from '../../hooks/useStore';
import {
    requestCreateProduct,
    requestDeleteProduct,
    requestGetCategories,
    requestGetProductByCategory,
    requestUpdateProduct,
    requestUploadImage,
} from '../../config/request';

const { TabPane } = Tabs;

const ProductManagement = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [viewMode, setViewMode] = useState('table');
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewVisible, setPreviewVisible] = useState(false);

    // Mock data for products
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            const res = await requestGetProductByCategory(selectedCategory, 1, 10);
            setProducts(res.metadata.products);
        };
        fetchProducts();
    }, [selectedCategory]);

    // Mock data for categories

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const res = await requestGetCategories();
            setCategories(res.metadata);
        };
        fetchCategories();
    }, []);

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

    const filteredProducts = products.filter((product) => {
        const matchSearch = product.productName.toLowerCase().includes(searchText.toLowerCase());
        const matchCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
        return matchSearch && matchCategory;
    });

    const columns = [
        {
            title: 'Ảnh',
            dataIndex: 'productImage',
            key: 'productImage',
            width: 100,
            render: (image) => (
                <Image
                    src={image}
                    alt="product"
                    width={80}
                    height={80}
                    className="object-cover rounded-md"
                    preview={{
                        mask: <EyeOutlined />,
                    }}
                />
            ),
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'productName',
            key: 'productName',
            sorter: (a, b) => a.productName.localeCompare(b.productName),
        },
        {
            title: 'Giá',
            dataIndex: 'productPrice',
            key: 'productPrice',
            render: (price) => `${price.toLocaleString()}đ`,
            sorter: (a, b) => a.productPrice - b.productPrice,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'productStatus',
            key: 'productStatus',
            render: (status) => {
                return status === 'active' ? <Tag color="success">Đang bán</Tag> : <Tag color="error">Ngừng bán</Tag>;
            },
            filters: [
                { text: 'Đang bán', value: 'active' },
                { text: 'Ngừng bán', value: 'inactive' },
            ],
            onFilter: (value, record) => record.productStatus === value,
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
                        title="Bạn có chắc muốn xóa sản phẩm này?"
                        description="Xóa sản phẩm sẽ xóa vĩnh viễn khỏi hệ thống."
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
        form.setFieldsValue({
            productName: record.productName,
            productPrice: record.productPrice,
            categoryId: record.categoryId,
            productDescription: record.productDescription,
            stock: record.stock,
            productStatus: record.productStatus === 'active',
            productImage: record.productImage
                ? [
                      {
                          uid: '-1',
                          name: 'image.png',
                          status: 'done',
                          url: record.productImage,
                      },
                  ]
                : [],
        });

        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await requestDeleteProduct(id);
            setProducts(products.filter((item) => item.id !== id));
            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    };

    const handleOk = () => {
        form.validateFields()
            .then(async (values) => {
                try {
                    setLoading(true);
                    const productStatus = values.productStatus ? 'active' : 'inactive';

                    if (editingId) {
                        // Xử lý cập nhật sản phẩm
                        let urlImage = values.productImage[0].url;

                        // Chỉ upload ảnh mới nếu có file mới được chọn
                        if (values.productImage[0].originFileObj) {
                            const formData = new FormData();
                            formData.append('image', values.productImage[0].originFileObj);
                            const uploadResponse = await requestUploadImage(formData);
                            urlImage = uploadResponse.metadata.secure_url;
                        }

                        const updatedProduct = {
                            productId: editingId,
                            productName: values.productName,
                            productPrice: values.productPrice,
                            categoryId: values.categoryId,
                            category: {
                                name: categories.find((c) => c.id === values.categoryId)?.name || '',
                            },
                            productDescription: values.productDescription,
                            productStatus,
                            productImage: urlImage,
                        };

                        await requestUpdateProduct(updatedProduct);
                        setProducts(
                            products.map((item) => (item.id === editingId ? { ...item, ...updatedProduct } : item)),
                        );
                    } else {
                        // Xử lý tạo sản phẩm mới
                        if (!values.productImage[0]?.originFileObj) {
                            throw new Error('Vui lòng chọn ảnh sản phẩm');
                        }

                        const formData = new FormData();
                        formData.append('image', values.productImage[0].originFileObj);
                        const uploadResponse = await requestUploadImage(formData);

                        const newProduct = {
                            id: crypto.randomUUID(),
                            productName: values.productName,
                            productPrice: values.productPrice,
                            categoryId: values.categoryId,
                            productImage: uploadResponse.metadata.secure_url,
                            productDescription: values.productDescription,
                            productStatus,
                            createdAt: new Date().toISOString(),
                        };

                        const createdProduct = await requestCreateProduct(newProduct);
                        setProducts([...products, createdProduct || newProduct]);
                    }

                    setIsModalVisible(false);
                    form.resetFields();
                } catch (error) {
                    console.error('Lỗi khi xử lý sản phẩm:', error);
                    // Có thể thêm thông báo lỗi cho user ở đây
                } finally {
                    setLoading(false);
                }
            })
            .catch((error) => {
                console.error('Lỗi validation:', error);
                setLoading(false);
            });
    };

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    const ProductCard = ({ product }) => (
        <Card
            hoverable
            cover={
                <div className="h-48 overflow-hidden">
                    <img
                        alt={product.productName}
                        src={product.productImage}
                        className="w-full h-full object-cover"
                        onClick={() => {
                            setPreviewImage(product.productImage);
                            setPreviewVisible(true);
                        }}
                    />
                </div>
            }
            className={`h-full ${product.productStatus === 'inactive' ? 'opacity-60' : ''}`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-medium mb-1 line-clamp-1">{product.productName}</h3>
                    <p className="text-red-500 font-medium mb-2">{product.productPrice.toLocaleString()}đ</p>
                </div>
                {product.productStatus === 'inactive' && <Tag color="error">Ngừng bán</Tag>}
            </div>
            <div className="flex justify-between">
                <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(product)}>
                    Sửa
                </Button>
                <Popconfirm
                    title="Bạn có chắc muốn xóa sản phẩm này?"
                    description="Xóa sản phẩm sẽ xóa vĩnh viễn khỏi hệ thống."
                    onConfirm={() => handleDelete(product.id)}
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
                <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Thêm sản phẩm mới
                </Button>
            </div>

            <Card className="mb-6">
                <div className="flex flex-wrap gap-4 justify-between">
                    <div className="flex flex-wrap gap-4">
                        <Input
                            placeholder="Tìm kiếm sản phẩm..."
                            prefix={<SearchOutlined className="text-gray-400" />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="w-64"
                        />
                        <Select
                            placeholder="Lọc theo danh mục"
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            className="w-48"
                            options={[
                                { value: 'all', label: 'Tất cả danh mục' },
                                ...categories.map((cat) => ({ value: cat.id, label: cat.categoryName })),
                            ]}
                        />
                    </div>
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
                {filteredProducts.length === 0 ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không tìm thấy sản phẩm nào" />
                ) : viewMode === 'table' ? (
                    <Table
                        columns={columns}
                        dataSource={filteredProducts}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        className="bg-white rounded-lg shadow-sm"
                    />
                ) : (
                    <Row gutter={[16, 16]}>
                        {filteredProducts.map((product) => (
                            <Col xs={24} sm={12} md={8} lg={6} xl={6} key={product.id}>
                                <ProductCard product={product} />
                            </Col>
                        ))}
                    </Row>
                )}
            </Spin>

            <Modal
                title={editingId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
                confirmLoading={loading}
                width={700}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Row gutter={16}>
                        <Col span={16}>
                            <Form.Item
                                name="productName"
                                label="Tên sản phẩm"
                                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="productPrice"
                                label="Giá"
                                rules={[{ required: true, message: 'Vui lòng nhập giá sản phẩm!' }]}
                            >
                                <InputNumber
                                    min={0}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    className="w-full"
                                    addonAfter="đ"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="categoryId"
                                label="Danh mục"
                                rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                            >
                                <Select placeholder="Chọn danh mục">
                                    {categories.map((cat) => (
                                        <Select.Option key={cat.id} value={cat.id}>
                                            {cat.categoryName}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                name="productStatus"
                                label="Trạng thái"
                                valuePropName="checked"
                                initialValue={true}
                            >
                                <Switch checkedChildren="Đang bán" unCheckedChildren="Ngừng bán" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="productDescription"
                        label="Mô tả sản phẩm"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả sản phẩm!' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="productImage"
                        label="Hình ảnh sản phẩm"
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                    >
                        <Upload listType="picture-card" beforeUpload={() => false} maxCount={1}>
                            <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>Tải lên</div>
                            </div>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal visible={previewVisible} footer={null} onCancel={() => setPreviewVisible(false)}>
                <img alt="preview" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </div>
    );
};

export default ProductManagement;
