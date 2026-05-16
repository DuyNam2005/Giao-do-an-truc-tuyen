import { useEffect, useState } from 'react';
import {
    Card,
    Row,
    Col,
    Statistic,
    Spin,
    Tabs,
    Table,
    Tag,
    Select,
    Progress,
    Avatar,
    Typography,
    List,
    Button,
    Modal,
    Form,
    Input,
    Upload,
    message,
} from 'antd';
import {
    UserOutlined,
    QuestionCircleOutlined,
    ShoppingOutlined,
    DollarOutlined,
    StarOutlined,
    RiseOutlined,
    HeartOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    TrophyOutlined,
    EditOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import { Column, Pie, Line, Area } from '@ant-design/plots';
import { requestGetDashboard, requestUpdateUser } from '../../config/request';
import { useStore } from '../../hooks/useStore';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const { dataUser, fetchAuth } = useStore();

    const [stats, setStats] = useState({
        users: {
            total: 0,
            byRole: [],
        },
        products: {
            total: 0,
            byCategory: [],
            byStatus: [],
        },
        questions: {
            total: 0,
            byStatus: [],
        },
        payments: {
            total: 0,
            totalRevenue: 0,
            byStatus: [],
            recentPayments: [],
        },
        reviews: {
            total: 0,
            average: 0,
            byRating: [],
        },
        favorites: {
            topProducts: [],
        },
        metrics: {
            averageOrderValue: 0,
            completionRate: 0,
            topCategories: [],
        },
    });
    const [timeRange, setTimeRange] = useState('all');

    // Fetch dashboard statistics
    useEffect(() => {
        const fetchDashboardStats = async () => {
            setLoading(true);
            try {
                const response = await requestGetDashboard();
                setStats(response.metadata || {});
            } catch (error) {
                console.error('Error fetching dashboard statistics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, [timeRange]);

    // Modal functions
    const showModal = () => {
        form.setFieldsValue(dataUser);
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const handleOk = async () => {
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
            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            console.error('Validation failed:', error);
            message.error('Cập nhật thất bại, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    // Configure chart for User Roles
    const userRolesConfig = {
        data: stats.users.byRole || [],
        angleField: 'count',
        colorField: 'role',
        radius: 0.8,
        legend: {
            position: 'bottom',
        },
        label: {
            type: 'outer',
            content: '{name}: {percentage}%',
            style: {
                fontSize: 14,
                fontWeight: 'bold',
            },
        },
        interactions: [{ type: 'element-active' }],
        color: ({ role }) => {
            const item = stats.users.byRole?.find((d) => d.role === role);
            return item?.color || '#1890ff';
        },
        statistic: {
            title: {
                style: {
                    fontSize: '16px',
                    lineHeight: 1.5,
                },
                customHtml: () => 'Tổng',
            },
            content: {
                style: {
                    fontSize: '24px',
                },
                customHtml: () => stats.users.total,
            },
        },
    };

    // Configure chart for Products by Category
    const productsByCategoryConfig = {
        data: stats.products.byCategory || [],
        xField: 'category',
        yField: 'count',
        seriesField: 'category',
        isGroup: true,
        columnStyle: {
            radius: [20, 20, 0, 0],
        },
        label: {
            position: 'middle',
            style: {
                fill: '#FFFFFF',
                opacity: 0.9,
                fontWeight: 'bold',
                fontSize: 12,
            },
        },
        meta: {
            count: {
                alias: 'Số lượng',
            },
        },
        colorField: 'category',
        color: ['#1890ff', '#52c41a', '#fa8c16', '#722ed1', '#eb2f96', '#f5222d'],
        legend: {
            position: 'bottom',
        },
    };

    // Configure chart for Products by Status
    const productsByStatusConfig = {
        data: stats.products.byStatus || [],
        angleField: 'count',
        colorField: 'status',
        radius: 0.8,
        legend: {
            position: 'bottom',
        },
        label: {
            type: 'inner',
            offset: '-30%',
            content: ({ percentage }) => `${percentage}%`,
            style: {
                fontSize: 14,
                fontWeight: 'bold',
                textAlign: 'center',
            },
        },
        color: ({ status }) => {
            const item = stats.products.byStatus?.find((d) => d.status === status);
            return item?.color || '#1890ff';
        },
        interactions: [{ type: 'element-active' }],
        statistic: {
            title: {
                style: {
                    fontSize: '16px',
                    lineHeight: 1.5,
                },
                customHtml: () => 'Tổng',
            },
            content: {
                style: {
                    fontSize: '24px',
                },
                customHtml: () => stats.products.total,
            },
        },
    };

    // Configure chart for Questions by Status
    const questionsByStatusConfig = {
        data: stats.questions.byStatus || [],
        angleField: 'count',
        colorField: 'status',
        radius: 0.8,
        legend: {
            position: 'bottom',
        },
        label: {
            type: 'outer',
            content: ({ status, percentage }) => `${status}: ${percentage}%`,
            style: {
                fontSize: 14,
                fontWeight: 'bold',
            },
        },
        color: ({ status }) => {
            const item = stats.questions.byStatus?.find((d) => d.status === status);
            return item?.color || '#1890ff';
        },
        interactions: [{ type: 'element-active' }],
        statistic: {
            title: {
                style: {
                    fontSize: '16px',
                    lineHeight: 1.5,
                },
                customHtml: () => 'Tổng',
            },
            content: {
                style: {
                    fontSize: '24px',
                },
                customHtml: () => stats.questions.total,
            },
        },
    };

    // Configure chart for Payment Status
    const paymentStatusConfig = {
        data: stats.payments.byStatus || [],
        xField: 'status',
        yField: 'count',
        seriesField: 'status',
        isGroup: true,
        columnStyle: {
            radius: [20, 20, 0, 0],
        },
        label: {
            position: 'middle',
            style: {
                fill: '#FFFFFF',
                opacity: 0.9,
                fontWeight: 'bold',
                fontSize: 12,
            },
        },
        color: ({ status }) => {
            if (status === 'success') return '#52c41a';
            if (status === 'failed') return '#f5222d';
            if (status === 'pending') return '#fa8c16';
            if (status === 'confirm') return '#1890ff';
            return '#722ed1';
        },
        legend: {
            position: 'bottom',
        },
    };

    // Configure chart for Revenue by Status
    const revenueByStatusConfig = {
        data: stats.payments.byStatus || [],
        xField: 'status',
        yField: 'revenue',
        seriesField: 'status',
        isGroup: true,
        columnStyle: {
            radius: [20, 20, 0, 0],
        },
        label: {
            position: 'middle',
            style: {
                fill: '#FFFFFF',
                opacity: 0.9,
                fontWeight: 'bold',
                fontSize: 12,
            },
            content: (item) => {
                return `${(item.revenue / 1000000).toFixed(1)}M`;
            },
        },
        color: ({ status }) => {
            if (status === 'success') return '#52c41a';
            if (status === 'failed') return '#f5222d';
            if (status === 'pending') return '#fa8c16';
            if (status === 'confirm') return '#1890ff';
            return '#722ed1';
        },
        legend: {
            position: 'bottom',
        },
        annotations: [
            {
                type: 'text',
                position: ['50%', '10%'],
                content: `Tổng doanh thu: ${new Intl.NumberFormat('vi-VN').format(stats.payments.totalRevenue || 0)}đ`,
                style: {
                    fontSize: 16,
                    fill: '#666',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            },
        ],
    };

    // Configure chart for Reviews by Rating
    const reviewsByRatingConfig = {
        data: stats.reviews.byRating || [],
        xField: 'rating',
        yField: 'count',
        meta: {
            rating: {
                alias: 'Đánh giá',
            },
            count: {
                alias: 'Số lượng',
            },
        },
        color: ({ rating }) => {
            if (rating <= 2) return '#f5222d';
            if (rating === 3) return '#fa8c16';
            if (rating === 4) return '#52c41a';
            return '#1890ff';
        },
        label: {
            position: 'middle',
            style: {
                fill: '#FFFFFF',
                opacity: 0.9,
                fontWeight: 'bold',
                fontSize: 12,
            },
        },
        columnStyle: {
            radius: [20, 20, 0, 0],
        },
        legend: false,
        xAxis: {
            label: {
                formatter: (v) => `${v} ★`,
            },
        },
    };

    // Configure chart for Top Favorite Products
    const topFavoritesConfig = {
        data: stats.favorites.topProducts || [],
        xField: 'count',
        yField: 'name',
        seriesField: 'name',
        legend: false,
        meta: {
            count: {
                alias: 'Số lượt thích',
            },
        },
        barStyle: {
            radius: [0, 10, 10, 0],
        },
        label: {
            position: 'right',
            formatter: (datum) => `${datum.count}`,
            style: {
                fill: '#000000',
            },
        },
        color: ['#722ed1', '#eb2f96', '#1890ff', '#52c41a', '#fa8c16', '#f5222d', '#13c2c2'],
        interactions: [{ type: 'element-active' }],
    };

    // Recent payments table columns
    const paymentsColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 120,
        },
        {
            title: 'Khách hàng',
            dataIndex: 'user',
            key: 'user',
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => `${new Intl.NumberFormat('vi-VN').format(amount)}đ`,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'blue';
                let text = 'Xác nhận';

                if (status === 'success') {
                    color = 'green';
                    text = 'Thành công';
                } else if (status === 'failed') {
                    color = 'red';
                    text = 'Thất bại';
                } else if (status === 'pending') {
                    color = 'orange';
                    text = 'Chờ xác nhận';
                } else if (status === 'shipping') {
                    color = 'purple';
                    text = 'Đang giao';
                }

                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: 'Ngày',
            dataIndex: 'date',
            key: 'date',
            width: 100,
        },
    ];

    const renderCompletionRate = () => (
        <Card bordered={false} className="h-full shadow-md">
            <Statistic
                title="Tỷ lệ hoàn thành đơn hàng"
                value={stats.metrics?.completionRate || 0}
                suffix="%"
                precision={0}
            />
            <Progress
                percent={stats.metrics?.completionRate || 0}
                strokeColor={
                    stats.metrics?.completionRate > 80
                        ? '#52c41a'
                        : stats.metrics?.completionRate > 50
                        ? '#1890ff'
                        : '#fa8c16'
                }
                status="active"
                strokeWidth={12}
                size="large"
            />
        </Card>
    );

    const renderAverageOrderValue = () => (
        <Card bordered={false} className="h-full shadow-md">
            <Statistic
                title="Giá trị đơn hàng trung bình"
                value={stats.metrics?.averageOrderValue || 0}
                formatter={(value) => `${new Intl.NumberFormat('vi-VN').format(value)}đ`}
                prefix={<RiseOutlined />}
            />
            <div className="mt-4 text-gray-500">
                <Text>Chỉ số này thể hiện mức chi tiêu trung bình trên mỗi đơn hàng</Text>
            </div>
        </Card>
    );

    const renderTopCategoriesSection = () => (
        <Card
            title={
                <Title level={5}>
                    <TrophyOutlined className="mr-2 text-yellow-500" />
                    Danh mục nổi bật
                </Title>
            }
            bordered={false}
            className="h-full shadow-md"
        >
            <List
                itemLayout="horizontal"
                dataSource={stats.metrics?.topCategories || []}
                renderItem={(category, index) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={
                                <Avatar
                                    style={{
                                        backgroundColor: index === 0 ? '#f5222d' : index === 1 ? '#fa8c16' : '#52c41a',
                                    }}
                                >
                                    {index + 1}
                                </Avatar>
                            }
                            title={<Text strong>{category}</Text>}
                        />
                    </List.Item>
                )}
            />
        </Card>
    );

    const renderFavoriteProductsList = () => (
        <Card bordered={false} className="shadow-md mb-6">
            <List
                itemLayout="horizontal"
                dataSource={stats.favorites?.topProducts?.slice(0, 5) || []}
                header={
                    <Title level={5}>
                        <HeartOutlined className="mr-2 text-red-500" />
                        Sản phẩm được yêu thích nhất
                    </Title>
                }
                renderItem={(item, index) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={
                                item.image ? (
                                    <Avatar src={item.image} />
                                ) : (
                                    <Avatar
                                        style={{
                                            backgroundColor:
                                                index === 0 ? '#f5222d' : index === 1 ? '#fa8c16' : '#1890ff',
                                        }}
                                    >
                                        {index + 1}
                                    </Avatar>
                                )
                            }
                            title={<Text strong>{item.name}</Text>}
                            description={
                                <div className="flex justify-between">
                                    <span>
                                        {item.count} <HeartOutlined className="text-red-500" />
                                    </span>
                                    <span className="font-semibold">
                                        {new Intl.NumberFormat('vi-VN').format(item.price || 0)}đ
                                    </span>
                                </div>
                            }
                        />
                    </List.Item>
                )}
            />
        </Card>
    );

    // Render personal information card
    const renderPersonalInfo = () => (
        <Card
            bordered={false}
            className="shadow-md mb-6 bg-white"
            title={
                <Title level={5}>
                    <UserOutlined className="mr-2 text-blue-500" />
                    Thông tin cá nhân
                </Title>
            }
            extra={
                <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={showModal}
                    className="bg-blue-500 hover:bg-blue-600"
                >
                    Chỉnh sửa
                </Button>
            }
        >
            <div className="flex flex-col md:flex-row items-center md:items-start">
                <div className="mb-4 md:mb-0 md:mr-8">
                    <Avatar
                        size={100}
                        src={dataUser.avatar}
                        icon={!dataUser.avatar && <UserOutlined />}
                        className="border-2 border-gray-200"
                    />
                </div>
                <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-500 mb-1">Họ và tên:</p>
                            <p className="font-semibold">{dataUser.fullName}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 mb-1">Email:</p>
                            <p className="font-semibold">{dataUser.email}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 mb-1">Số điện thoại:</p>
                            <p className="font-semibold">{dataUser.phone}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 mb-1">Vai trò:</p>
                            <p className="font-semibold">
                                <Tag color="blue">{dataUser.role}</Tag>
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500 mb-1">Địa chỉ:</p>
                            <p className="font-semibold">{dataUser?.address}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 mb-1">Ngày tham gia:</p>
                            <p className="font-semibold">{dayjs(dataUser.createdAt).format('DD/MM/YYYY')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-center bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-white">Bảng Điều Khiển</h1>

                <Select
                    defaultValue="all"
                    style={{ width: 200 }}
                    onChange={(value) => setTimeRange(value)}
                    className="border border-white"
                    options={[
                        { value: 'today', label: 'Hôm nay' },
                        { value: 'week', label: '7 ngày qua' },
                        { value: 'month', label: '30 ngày qua' },
                        { value: 'all', label: 'Tất cả thời gian' },
                    ]}
                />
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-md">
                    <Spin size="large" />
                    <p className="ml-3 text-gray-600">Đang tải dữ liệu thống kê...</p>
                </div>
            ) : (
                <>
                    {/* Personal Information */}
                    {renderPersonalInfo()}

                    {/* Overview Statistics */}
                    <Row gutter={[16, 16]} className="mb-6 mt-6">
                        <Col xs={24} sm={12} md={6}>
                            <Card
                                bordered={false}
                                className="h-full shadow-md hover:shadow-lg transition-shadow bg-gradient-to-r from-blue-50 to-blue-100"
                            >
                                <Statistic
                                    title={<span className="text-blue-800 font-semibold">Tổng người dùng</span>}
                                    value={stats.users.total}
                                    prefix={<UserOutlined className="text-blue-500" />}
                                    className="text-center"
                                    valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card
                                bordered={false}
                                className="h-full shadow-md hover:shadow-lg transition-shadow bg-gradient-to-r from-green-50 to-green-100"
                            >
                                <Statistic
                                    title={<span className="text-green-800 font-semibold">Tổng sản phẩm</span>}
                                    value={stats.products.total}
                                    prefix={<ShoppingOutlined className="text-green-500" />}
                                    className="text-center"
                                    valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card
                                bordered={false}
                                className="h-full shadow-md hover:shadow-lg transition-shadow bg-gradient-to-r from-orange-50 to-orange-100"
                            >
                                <Statistic
                                    title={<span className="text-orange-800 font-semibold">Câu hỏi</span>}
                                    value={stats.questions.total}
                                    prefix={<QuestionCircleOutlined className="text-orange-500" />}
                                    className="text-center"
                                    valueStyle={{ color: '#fa8c16', fontWeight: 'bold' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card
                                bordered={false}
                                className="h-full shadow-md hover:shadow-lg transition-shadow bg-gradient-to-r from-red-50 to-red-100"
                            >
                                <Statistic
                                    title={<span className="text-red-800 font-semibold">Doanh thu</span>}
                                    value={stats.payments.totalRevenue}
                                    prefix={<DollarOutlined className="text-red-500" />}
                                    suffix="đ"
                                    formatter={(value) => `${new Intl.NumberFormat('vi-VN').format(value)}`}
                                    className="text-center"
                                    valueStyle={{ color: '#cf1322', fontWeight: 'bold' }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Additional Metrics */}
                    <Row gutter={[16, 16]} className="mb-6">
                        <Col xs={24} md={8}>
                            {renderCompletionRate()}
                        </Col>
                        <Col xs={24} md={8}>
                            {renderAverageOrderValue()}
                        </Col>
                        <Col xs={24} md={8}>
                            {renderTopCategoriesSection()}
                        </Col>
                    </Row>

                    {/* Featured Products */}
                    {renderFavoriteProductsList()}

                    {/* Charts */}
                    <Tabs
                        defaultActiveKey="1"
                        type="card"
                        className="mb-6 bg-white rounded-lg shadow-md p-2"
                        items={[
                            {
                                key: '1',
                                label: (
                                    <span>
                                        <UserOutlined /> Người dùng & Sản phẩm
                                    </span>
                                ),
                                children: (
                                    <Row gutter={[16, 16]}>
                                        <Col xs={24} md={12}>
                                            <Card
                                                title={
                                                    <Title level={5}>
                                                        <UserOutlined className="mr-2 text-blue-500" />
                                                        Phân bố người dùng theo vai trò
                                                    </Title>
                                                }
                                                bordered={false}
                                                className="h-full shadow-md"
                                            >
                                                <Pie {...userRolesConfig} height={300} />
                                            </Card>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Card
                                                title={
                                                    <Title level={5}>
                                                        <ShoppingOutlined className="mr-2 text-green-500" />
                                                        Sản phẩm theo danh mục
                                                    </Title>
                                                }
                                                bordered={false}
                                                className="h-full shadow-md"
                                            >
                                                <Column {...productsByCategoryConfig} height={300} />
                                            </Card>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Card
                                                title={
                                                    <Title level={5}>
                                                        <ShoppingOutlined className="mr-2 text-blue-500" />
                                                        Trạng thái sản phẩm
                                                    </Title>
                                                }
                                                bordered={false}
                                                className="h-full shadow-md"
                                            >
                                                <Pie {...productsByStatusConfig} height={300} />
                                            </Card>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Card
                                                title={
                                                    <Title level={5}>
                                                        <QuestionCircleOutlined className="mr-2 text-orange-500" />
                                                        Trạng thái câu hỏi
                                                    </Title>
                                                }
                                                bordered={false}
                                                className="h-full shadow-md"
                                            >
                                                <Pie {...questionsByStatusConfig} height={300} />
                                            </Card>
                                        </Col>
                                    </Row>
                                ),
                            },
                            {
                                key: '2',
                                label: (
                                    <span>
                                        <DollarOutlined /> Thanh toán & Đánh giá
                                    </span>
                                ),
                                children: (
                                    <Row gutter={[16, 16]}>
                                        <Col xs={24} md={12}>
                                            <Card
                                                title={
                                                    <Title level={5}>
                                                        <ShoppingOutlined className="mr-2 text-green-500" />
                                                        Số lượng đơn hàng theo trạng thái
                                                    </Title>
                                                }
                                                bordered={false}
                                                className="h-full shadow-md"
                                            >
                                                <Column {...paymentStatusConfig} height={300} />
                                            </Card>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Card
                                                title={
                                                    <Title level={5}>
                                                        <DollarOutlined className="mr-2 text-red-500" />
                                                        Doanh thu theo trạng thái đơn hàng
                                                    </Title>
                                                }
                                                bordered={false}
                                                className="h-full shadow-md"
                                            >
                                                <Column {...revenueByStatusConfig} height={300} />
                                            </Card>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Card
                                                title={
                                                    <Title level={5}>
                                                        <StarOutlined className="mr-2 text-yellow-500" />
                                                        Đánh giá sản phẩm
                                                    </Title>
                                                }
                                                bordered={false}
                                                className="h-full shadow-md"
                                            >
                                                <Column {...reviewsByRatingConfig} height={300} />
                                                <div className="text-center mt-4 p-3 bg-gray-50 rounded-lg">
                                                    <Statistic
                                                        title={
                                                            <span className="font-semibold">Đánh giá trung bình</span>
                                                        }
                                                        value={stats.reviews.average}
                                                        precision={1}
                                                        prefix={<StarOutlined className="text-yellow-500" />}
                                                        suffix="/ 5"
                                                        valueStyle={{
                                                            color: '#faad14',
                                                            fontWeight: 'bold',
                                                            fontSize: '24px',
                                                        }}
                                                    />
                                                </div>
                                            </Card>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Card
                                                title={
                                                    <Title level={5}>
                                                        <HeartOutlined className="mr-2 text-red-500" />
                                                        Top sản phẩm được yêu thích
                                                    </Title>
                                                }
                                                bordered={false}
                                                className="h-full shadow-md"
                                            >
                                                <Column {...topFavoritesConfig} height={300} />
                                            </Card>
                                        </Col>
                                    </Row>
                                ),
                            },
                        ]}
                    />

                    {/* Recent Payments */}
                    <Card
                        title={
                            <Title level={5}>
                                <ShoppingOutlined className="mr-2 text-blue-500" />
                                Đơn hàng gần đây
                            </Title>
                        }
                        bordered={false}
                        className="shadow-md"
                    >
                        <Table
                            columns={paymentsColumns}
                            dataSource={stats.payments.recentPayments}
                            rowKey="id"
                            pagination={{ pageSize: 5 }}
                            rowClassName="hover:bg-blue-50"
                        />
                    </Card>
                </>
            )}

            {/* Edit Profile Modal */}
            <Modal
                title="Chỉnh sửa thông tin cá nhân"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                confirmLoading={loading}
                okText="Lưu"
                cancelText="Hủy"
                okButtonProps={{ className: 'bg-blue-500 hover:bg-blue-600' }}
            >
                <Form form={form} layout="vertical" initialValues={dataUser} className="pt-4">
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
                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
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
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                    >
                        <Input placeholder="Nhập số điện thoại" />
                    </Form.Item>
                    <Form.Item name="address" label="Địa chỉ">
                        <Input.TextArea rows={3} placeholder="Nhập địa chỉ" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default Dashboard;
