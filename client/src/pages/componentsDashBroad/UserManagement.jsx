import React, { useEffect, useState } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    Space,
    Popconfirm,
    Avatar,
    Card,
    Row,
    Col,
    Tabs,
    Tag,
    Statistic,
    Divider,
    Badge,
    Input as AntInput,
} from 'antd';
import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    UserOutlined,
    LockOutlined,
    SearchOutlined,
    TeamOutlined,
    UserSwitchOutlined,
    MailOutlined,
    PhoneOutlined,
    CalendarOutlined,
} from '@ant-design/icons';
import { requestDeleteUser, requestGetUsers, requestUpdatePassword, requestUpdateUser } from '../../config/request';

const { TabPane } = Tabs;
const { Search } = AntInput;
import dayjs from 'dayjs';

import moment from 'moment';

const UserManagement = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [viewMode, setViewMode] = useState('table');
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState(null);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [passwordForm] = Form.useForm();
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');

    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        const res = await requestGetUsers();
        setUsers(res.metadata);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Mock data for users
    // Filter users based on search text and role
    const filteredUsers = users.filter((user) => {
        const matchText =
            user.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
            user.email.toLowerCase().includes(searchText.toLowerCase()) ||
            user.phone.includes(searchText);

        const matchRole = selectedRole === 'all' || user.role === selectedRole;

        return matchText && matchRole;
    });

    // Count users by role and status
    const userStats = {
        total: users.length,
        admin: users.filter((u) => u.role === 'admin').length,
        driver: users.filter((u) => u.role === 'driver').length,
        customers: users.filter((u) => u.role === 'user').length,
    };

    const getRoleBadge = (role) => {
        let color, text, icon;

        switch (role) {
            case 'admin':
                color = '#f5222d';
                text = 'Quản trị viên';
                icon = <UserSwitchOutlined />;
                break;
            case 'driver':
                color = '#1677ff';
                text = 'Nhân viên';
                icon = <TeamOutlined />;
                break;
            case 'user':
                color = '#52c41a';
                text = 'Khách hàng';
                icon = <UserOutlined />;
                break;
            default:
                color = '#d9d9d9';
                text = role;
                icon = <UserOutlined />;
        }

        return (
            <Tag
                color={color}
                style={{
                    color: color,
                    backgroundColor: `${color}15`,
                    border: `1px solid ${color}`,
                    padding: '3px 8px',
                }}
            >
                {icon} {text}
            </Tag>
        );
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60,
        },
        {
            title: 'Người dùng',
            key: 'user',
            render: (_, record) => (
                <div className="flex items-center">
                    <Avatar src={record.avatar} icon={<UserOutlined />} size={40} className="mr-3" />
                    <div>
                        <div className="font-medium">{record.fullName}</div>
                        <div className="text-gray-500 text-xs flex items-center">
                            <MailOutlined className="mr-1" /> {record.email}
                        </div>
                    </div>
                </div>
            ),
            sorter: (a, b) => a.fullName.localeCompare(b.fullName),
        },
        {
            title: 'Liên hệ',
            key: 'contact',
            render: (_, record) => (
                <div>
                    <div className="flex items-center mb-1">
                        <PhoneOutlined className="mr-1 text-gray-500" />
                        <span>{record.phone}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                        <CalendarOutlined className="mr-1" />
                        <span>Tham gia: {dayjs(record.createdAt).format('DD/MM/YYYY')}</span>
                    </div>
                </div>
            ),
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role) => getRoleBadge(role),
            filters: [
                { text: 'Quản trị viên', value: 'admin' },
                { text: 'Nhân viên', value: 'driver' },
                { text: 'Khách hàng', value: 'user' },
            ],
            onFilter: (value, record) => record.role === value,
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small" />
                    <Button icon={<LockOutlined />} onClick={() => handleResetPassword(record.id)} size="small" />
                    <Popconfirm
                        title="Bạn có chắc muốn xóa người dùng này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button danger icon={<DeleteOutlined />} size="small" />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const handleEdit = (record) => {
        setEditingId(record.id);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            const data = {
                userId: id,
            };
            await requestDeleteUser(data);
            fetchUsers();
        } catch (error) {
            console.log(error);
        }
    };

    const handleOk = async () => {
        form.validateFields().then(async (values) => {
            if (editingId) {
                const data = {
                    userId: editingId,
                    ...values,
                };
                await requestUpdateUser(data);
                fetchUsers();
                setIsModalVisible(false);
            }
        });
    };

    const handleResetPassword = (id) => {
        setSelectedUserId(id);
        passwordForm.resetFields();
        setPasswordModalVisible(true);
    };

    const handlePasswordOk = async () => {
        passwordForm.validateFields().then(async (values) => {
            const data = {
                userId: selectedUserId,
                password: values.password,
            };
            await requestUpdatePassword(data);
            setPasswordModalVisible(false);
        });
    };

    const UserCard = ({ user }) => {
        const roleColors = {
            admin: '#f5222d',
            staff: '#1677ff',
            user: '#52c41a',
        };

        return (
            <Card
                className="h-full hover:shadow-md transition-all"
                actions={[
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(user)} key="edit">
                        Sửa
                    </Button>,
                    <Button icon={<LockOutlined />} onClick={() => handleResetPassword(user.id)} key="reset">
                        Đổi MK
                    </Button>,
                    <Popconfirm
                        title="Bạn có chắc muốn xóa người dùng này?"
                        onConfirm={() => handleDelete(user.id)}
                        okText="Có"
                        cancelText="Không"
                        key="delete"
                    >
                        <Button danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>,
                ]}
            >
                <div className="flex flex-col items-center mb-4">
                    <div
                        className="relative mb-2"
                        style={{
                            borderColor: roleColors[user.role],
                            borderWidth: 2,
                            borderStyle: 'solid',
                            borderRadius: '50%',
                            padding: 2,
                        }}
                    >
                        <Avatar src={user.avatar} icon={<UserOutlined />} size={80} />
                        <Badge
                            status={user.status === 'active' ? 'success' : 'default'}
                            className="absolute bottom-0 right-0 border-2 border-white"
                        />
                    </div>
                    <div className="text-center">
                        <h3 className="font-medium text-base mb-0">{user.fullName}</h3>
                        <p className="text-gray-500 text-sm mb-1">{user.email}</p>
                        {getRoleBadge(user.role)}
                    </div>
                </div>
                <Divider className="my-3" />
                <div className="space-y-2">
                    <div className="flex items-center">
                        <PhoneOutlined className="text-gray-400 mr-2" />
                        <span>{user.phone}</span>
                    </div>
                    <div className="flex items-center">
                        <CalendarOutlined className="text-gray-400 mr-2" />
                        <span>Tham gia: {dayjs(user.createdAt).format('DD/MM/YYYY')}</span>
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <div className="p-6">
            {/* User statistics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                <Card className="text-center hover:shadow-md transition-shadow">
                    <Statistic
                        title="Tổng người dùng"
                        value={userStats.total}
                        valueStyle={{ color: '#1677ff' }}
                        prefix={<TeamOutlined />}
                    />
                </Card>
                <Card className="text-center hover:shadow-md transition-shadow">
                    <Statistic title="Quản trị viên" value={userStats.admin} valueStyle={{ color: '#f5222d' }} />
                </Card>
                <Card className="text-center hover:shadow-md transition-shadow">
                    <Statistic title="Tài xế" value={userStats.driver} valueStyle={{ color: '#1677ff' }} />
                </Card>
                <Card className="text-center hover:shadow-md transition-shadow">
                    <Statistic title="Khách hàng" value={userStats.customers} valueStyle={{ color: '#52c41a' }} />
                </Card>
            </div>

            {/* Filter section */}
            <Card className="mb-6">
                <div className="flex flex-wrap gap-4 justify-between">
                    <Search
                        placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                        allowClear
                        onChange={(e) => setSearchText(e.target.value)}
                        className="max-w-md"
                        prefix={<SearchOutlined className="text-gray-400" />}
                    />
                    <div className="flex gap-4 flex-wrap">
                        <Select
                            placeholder="Vai trò"
                            className="min-w-[150px]"
                            value={selectedRole}
                            onChange={setSelectedRole}
                            options={[
                                { value: 'all', label: 'Tất cả vai trò' },
                                { value: 'admin', label: 'Quản trị viên' },
                                { value: 'driver', label: 'Tài xế' },
                                { value: 'user', label: 'Khách hàng' },
                            ]}
                        />
                        <div className="flex gap-2">
                            <Button
                                type={viewMode === 'table' ? 'primary' : 'default'}
                                onClick={() => setViewMode('table')}
                            >
                                Dạng bảng
                            </Button>
                            <Button
                                type={viewMode === 'grid' ? 'primary' : 'default'}
                                onClick={() => setViewMode('grid')}
                            >
                                Dạng lưới
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* User tabs */}
            <Tabs defaultActiveKey="all">
                <TabPane tab={`Tất cả người dùng (${userStats.total})`} key="all">
                    {viewMode === 'table' ? (
                        <Table
                            columns={columns}
                            dataSource={filteredUsers}
                            rowKey="id"
                            pagination={{ pageSize: 6 }}
                            className="bg-white rounded-lg shadow-sm"
                        />
                    ) : (
                        <Row gutter={[16, 16]}>
                            {filteredUsers.map((user) => (
                                <Col xs={24} sm={12} md={8} lg={6} key={user.id}>
                                    <UserCard user={user} />
                                </Col>
                            ))}
                        </Row>
                    )}
                </TabPane>
                <TabPane tab={`Quản trị viên (${userStats.admin})`} key="admin">
                    {viewMode === 'table' ? (
                        <Table
                            columns={columns}
                            dataSource={users.filter((u) => u.role === 'admin')}
                            rowKey="id"
                            pagination={{ pageSize: 6 }}
                            className="bg-white rounded-lg shadow-sm"
                        />
                    ) : (
                        <Row gutter={[16, 16]}>
                            {users
                                .filter((u) => u.role === 'admin')
                                .map((user) => (
                                    <Col xs={24} sm={12} md={8} lg={6} key={user.id}>
                                        <UserCard user={user} />
                                    </Col>
                                ))}
                        </Row>
                    )}
                </TabPane>
                <TabPane tab={`Tài xế (${userStats.driver})`} key="driver">
                    {viewMode === 'table' ? (
                        <Table
                            columns={columns}
                            dataSource={users.filter((u) => u.role === 'driver')}
                            rowKey="id"
                            pagination={{ pageSize: 6 }}
                            className="bg-white rounded-lg shadow-sm"
                        />
                    ) : (
                        <Row gutter={[16, 16]}>
                            {users
                                .filter((u) => u.role === 'driver')
                                .map((user) => (
                                    <Col xs={24} sm={12} md={8} lg={6} key={user.id}>
                                        <UserCard user={user} />
                                    </Col>
                                ))}
                        </Row>
                    )}
                </TabPane>
                <TabPane tab={`Khách hàng (${userStats.customers})`} key="customers">
                    {viewMode === 'table' ? (
                        <Table
                            columns={columns}
                            dataSource={users.filter((u) => u.role === 'user')}
                            rowKey="id"
                            pagination={{ pageSize: 6 }}
                            className="bg-white rounded-lg shadow-sm"
                        />
                    ) : (
                        <Row gutter={[16, 16]}>
                            {users
                                .filter((u) => u.role === 'user')
                                .map((user) => (
                                    <Col xs={24} sm={12} md={8} lg={6} key={user.id}>
                                        <UserCard user={user} />
                                    </Col>
                                ))}
                        </Row>
                    )}
                </TabPane>
            </Tabs>

            <Modal
                title={editingId ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
                width={600}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="fullName"
                                label="Họ tên"
                                rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="phone"
                                label="Điện thoại"
                                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="role"
                                label="Vai trò"
                                rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                            >
                                <Select>
                                    <Select.Option value="admin">Quản trị viên</Select.Option>
                                    <Select.Option value="driver">Tài xế</Select.Option>
                                    <Select.Option value="user">Khách hàng</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="address" label="Địa chỉ">
                        <Input.TextArea rows={2} />
                    </Form.Item>

                    {!editingId && (
                        <Form.Item
                            name="password"
                            label="Mật khẩu"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                        >
                            <Input.Password />
                        </Form.Item>
                    )}
                </Form>
            </Modal>

            <Modal
                title="Đặt lại mật khẩu"
                open={passwordModalVisible}
                onOk={handlePasswordOk}
                onCancel={() => setPasswordModalVisible(false)}
            >
                <Form form={passwordForm} layout="vertical">
                    <Form.Item
                        name="password"
                        label="Mật khẩu mới"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Xác nhận mật khẩu"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;
