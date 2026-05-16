import React, { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Button,
    Space,
    Tag,
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    DatePicker,
    Typography,
    Badge,
    Empty,
    message,
    Tooltip,
    Popconfirm,
    Drawer,
    Descriptions,
    Divider,
    Row,
    Col,
} from 'antd';
import {
    SearchOutlined,
    ReloadOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    ExclamationCircleOutlined,
    PercentageOutlined,
    CalendarOutlined,
    GiftOutlined,
    DollarOutlined,
} from '@ant-design/icons';
import { toast, ToastContainer } from 'react-toastify';
import moment from 'moment';
import {
    requestCreateCoupon,
    requestDeleteCoupon,
    requestGetAllCoupon,
    requestUpdateCoupon,
} from '../../config/request';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

function CouponAdmin() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [viewCoupon, setViewCoupon] = useState(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [form] = Form.useForm();

    const fetchCoupon = async () => {
        const res = await requestGetAllCoupon();
        setCoupons(res.data);
    };
    useEffect(() => {
        fetchCoupon();
    }, []);

    // Lọc mã giảm giá theo từ khóa tìm kiếm
    const filteredCoupons = coupons.filter((coupon) => {
        return coupon.nameCoupon.toLowerCase().includes(searchText.toLowerCase());
    });

    // Xem chi tiết mã giảm giá
    const handleViewCoupon = (record) => {
        setViewCoupon(record);
        setDrawerVisible(true);
    };

    // Mở modal thêm mã giảm giá mới
    const handleAdd = () => {
        setEditingCoupon(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    // Mở modal chỉnh sửa mã giảm giá
    const handleEdit = (record) => {
        setEditingCoupon(record);
        form.setFieldsValue({
            nameCoupon: record.nameCoupon,
            discount: record.discount,
            quantity: record.quantity,
            dateRange: [moment(record.startDate), moment(record.endDate)],
            minPrice: record.minPrice,
        });
        setIsModalOpen(true);
    };

    // Xử lý xóa mã giảm giá
    const handleDelete = async (id) => {
        setLoading(true);
        // Giả lập API call
        try {
            await requestDeleteCoupon(id);
            fetchCoupon();
            toast.success('Đã xóa mã giảm giá thành công');
            setLoading(false);
            setIsModalOpen(false);
        } catch (error) {
            toast.error('Đã xảy ra lỗi khi xóa mã giảm giá');
            setLoading(false);
        }
    };

    // Xử lý lưu (thêm/sửa) mã giảm giá
    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            // Xử lý ngày bắt đầu và kết thúc từ dateRange
            const startDate = values.dateRange[0].format('YYYY-MM-DD') + 'T00:00:00.000Z';
            const endDate = values.dateRange[1].format('YYYY-MM-DD') + 'T23:59:59.999Z';

            // Giả lập API call
            setTimeout(async () => {
                if (editingCoupon) {
                    // Cập nhật mã giảm giá
                    const data = {
                        id: editingCoupon.id,
                        nameCoupon: values.nameCoupon,
                        discount: values.discount,
                        quantity: values.quantity,
                        startDate,
                        endDate,
                        minPrice: values.minPrice,
                    };
                    await requestUpdateCoupon(data);
                    fetchCoupon();
                    toast.success('Đã cập nhật mã giảm giá thành công');
                } else {
                    // Thêm mã giảm giá mới
                    const newCoupon = {
                        id: (coupons.length + 1).toString(),
                        nameCoupon: values.nameCoupon,
                        discount: values.discount,
                        quantity: values.quantity,
                        startDate,
                        endDate,
                        minPrice: values.minPrice,
                        createdAt: new Date().toISOString(),
                    };
                    await requestCreateCoupon(newCoupon);
                    fetchCoupon();
                }
                setIsModalOpen(false);
                setLoading(false);
            }, 500);
        } catch (error) {
            toast.error('Đã xảy ra lỗi khi lưu mã giảm giá');
        }
    };

    // Đóng modal
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    // Làm mới danh sách
    const handleRefresh = () => {
        setLoading(true);
        // Giả lập API call
        setTimeout(() => {
            setCoupons(mockCoupons);
            setLoading(false);
            message.success('Đã làm mới danh sách mã giảm giá');
        }, 500);
    };

    // Kiểm tra trạng thái mã giảm giá (còn hạn/hết hạn)
    const getCouponStatus = (startDate, endDate) => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (now < start) {
            return { status: 'warning', text: 'Sắp diễn ra' };
        } else if (now > end) {
            return { status: 'error', text: 'Đã hết hạn' };
        } else {
            return { status: 'success', text: 'Đang hoạt động' };
        }
    };

    // Định nghĩa cột cho bảng
    const columns = [
        {
            title: 'Mã giảm giá',
            dataIndex: 'nameCoupon',
            key: 'nameCoupon',
            render: (text) => <span className="font-medium text-blue-600">{text}</span>,
        },
        {
            title: 'Giảm giá',
            dataIndex: 'discount',
            key: 'discount',
            render: (discount) => <Tag color="green">{discount}%</Tag>,
            sorter: (a, b) => a.discount - b.discount,
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            sorter: (a, b) => a.quantity - b.quantity,
        },
        {
            title: 'Giá tối thiểu',
            dataIndex: 'minPrice',
            key: 'minPrice',
            render: (price) => <span>{price.toLocaleString()}đ</span>,
            sorter: (a, b) => a.minPrice - b.minPrice,
        },
        {
            title: 'Thời gian',
            key: 'timeRange',
            render: (_, record) => (
                <div>
                    <div>{moment(record.startDate).format('DD/MM/YYYY')}</div>
                    <div>đến</div>
                    <div>{moment(record.endDate).format('DD/MM/YYYY')}</div>
                </div>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewCoupon(record)}
                            className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                            className="text-green-500 hover:text-green-600 hover:bg-green-50"
                        />
                    </Tooltip>
                    <Tooltip title="Xoá">
                        <Popconfirm
                            title="Xoá mã giảm giá này?"
                            description="Bạn chắc chắn muốn xoá mã giảm giá này? Hành động này không thể hoàn tác."
                            onConfirm={() => handleDelete(record.id)}
                            okText="Xoá"
                            cancelText="Huỷ"
                            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                        >
                            <Button type="text" danger icon={<DeleteOutlined />} className="hover:bg-red-50" />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Card bordered={false} className="shadow-sm mb-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                    <div className="mb-4 md:mb-0">
                        <Title level={4} className="!mb-1">
                            Quản lý mã giảm giá
                        </Title>
                        <Text type="secondary">Quản lý tất cả mã giảm giá cho tour du lịch</Text>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Input
                            placeholder="Tìm kiếm mã giảm giá..."
                            prefix={<SearchOutlined className="text-gray-400" />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="w-64"
                        />
                        <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading} />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAdd}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Thêm mã giảm giá
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-lg overflow-hidden">
                    <Table
                        columns={columns}
                        dataSource={filteredCoupons}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            pageSizeOptions: ['10', '20', '50'],
                            showTotal: (total) => `Tổng ${total} mã giảm giá`,
                        }}
                        locale={{
                            emptyText: <Empty description="Không có dữ liệu" />,
                        }}
                    />
                </div>
            </Card>

            {/* Modal thêm/sửa mã giảm giá */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        {editingCoupon ? (
                            <>
                                <EditOutlined className="text-blue-500" />
                                <span>Chỉnh sửa mã giảm giá</span>
                            </>
                        ) : (
                            <>
                                <PlusOutlined className="text-green-500" />
                                <span>Thêm mã giảm giá mới</span>
                            </>
                        )}
                    </div>
                }
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                okText={editingCoupon ? 'Cập nhật' : 'Thêm mới'}
                cancelText="Huỷ"
                confirmLoading={loading}
                centered
                maskClosable={false}
                className="rounded-xl"
                width={700}
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="nameCoupon"
                                label="Mã giảm giá"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mã giảm giá' },
                                    { min: 3, message: 'Mã giảm giá phải có ít nhất 3 ký tự' },
                                ]}
                            >
                                <Input placeholder="Nhập mã giảm giá" prefix={<GiftOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="discount"
                                label="Phần trăm giảm giá"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập phần trăm giảm giá' },
                                    { type: 'number', min: 1, max: 100, message: 'Giảm giá phải từ 1% đến 100%' },
                                ]}
                            >
                                <InputNumber
                                    min={1}
                                    max={100}
                                    style={{ width: '100%' }}
                                    placeholder="Nhập phần trăm giảm giá"
                                    addonAfter="%"
                                    prefix={<PercentageOutlined />}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="quantity"
                                label="Số lượng"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập số lượng' },
                                    { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' },
                                ]}
                            >
                                <InputNumber
                                    min={1}
                                    style={{ width: '100%' }}
                                    placeholder="Nhập số lượng mã giảm giá"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="minPrice"
                                label="Giá tối thiểu"
                                rules={[{ required: true, message: 'Vui lòng nhập giá tối thiểu' }]}
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: '100%' }}
                                    placeholder="Nhập giá tối thiểu để áp dụng"
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    addonAfter="đ"
                                    prefix={<DollarOutlined />}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="dateRange"
                        label="Thời gian áp dụng"
                        rules={[{ required: true, message: 'Vui lòng chọn thời gian áp dụng' }]}
                    >
                        <RangePicker
                            style={{ width: '100%' }}
                            format="DD/MM/YYYY"
                            placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Drawer xem chi tiết mã giảm giá */}
            <Drawer
                title={
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-medium">Chi tiết mã giảm giá</span>
                        <Tag color="blue">{viewCoupon?.nameCoupon}</Tag>
                    </div>
                }
                placement="right"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                width={500}
            >
                {viewCoupon && (
                    <div>
                        <Descriptions bordered column={1} size="small" className="mb-6">
                            <Descriptions.Item
                                label={
                                    <>
                                        <GiftOutlined className="mr-2" /> Mã giảm giá
                                    </>
                                }
                            >
                                <Tag color="blue" className="text-base px-4 py-1">
                                    {viewCoupon.nameCoupon}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <>
                                        <PercentageOutlined className="mr-2" /> Phần trăm giảm giá
                                    </>
                                }
                            >
                                <Tag color="green" className="text-base px-4 py-1">
                                    {viewCoupon.discount}%
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Số lượng">{viewCoupon.quantity}</Descriptions.Item>
                            <Descriptions.Item label="Giá tối thiểu">
                                {viewCoupon.minPrice.toLocaleString()}đ
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <>
                                        <CalendarOutlined className="mr-2" /> Thời gian áp dụng
                                    </>
                                }
                            >
                                <div>{moment(viewCoupon.startDate).format('DD/MM/YYYY')} đến</div>
                                <div>{moment(viewCoupon.endDate).format('DD/MM/YYYY')}</div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                {(() => {
                                    const { status, text } = getCouponStatus(viewCoupon.startDate, viewCoupon.endDate);
                                    return <Badge status={status} text={text} />;
                                })()}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">
                                {moment(viewCoupon.createdAt).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Drawer>
        </div>
    );
}

export default CouponAdmin;
