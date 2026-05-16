import React, { useState, useEffect } from 'react';
import { Layout, Typography, theme, Avatar, Badge, Dropdown, Button, message, Spin } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, BellOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import Sidebar from './componentsDashBroad/Sidebar';
import Dashboard from './componentsDashBroad/Dashboard';
import CategoryManagement from './componentsDashBroad/CategoryManagement';
import ProductManagement from './componentsDashBroad/ProductManagement';
import OrderManagement from './componentsDashBroad/OrderManagement';
import UserManagement from './componentsDashBroad/UserManagement';
// import { request } from '../config/request';
import { useNavigate } from 'react-router-dom';
import CouponAdmin from './componentsDashBroad/CounponManagement';
import QuestionManagement from './componentsDashBroad/QuestionManagement';

const { Content, Sider, Header } = Layout;
const { Title } = Typography;

function DashBroad() {
    const [selectedKey, setSelectedKey] = useState('dashboard');
    const [collapsed, setCollapsed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [adminInfo, setAdminInfo] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const { token } = theme.useToken();
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth();
        fetchNotifications();
    }, []);

    const checkAuth = async () => {
        // try {
        //     const response = await request.get('/users/profile');
        //     if (response.data && response.data.metadata) {
        //         const userData = response.data.metadata;
        //         if (userData.role !== 'admin') {
        //             message.error('Bạn không có quyền truy cập trang này');
        //             navigate('/login');
        //             return;
        //         }
        //         setAdminInfo(userData);
        //     }
        // } catch (error) {
        //     console.error('Auth error:', error);
        //     message.error('Vui lòng đăng nhập để tiếp tục');
        //     navigate('/login');
        // } finally {
        //     setLoading(false);
        // }
    };

    const fetchNotifications = async () => {
        try {
            // Đây là nơi bạn sẽ gọi API để lấy thông báo
            // Hiện tại sử dụng dữ liệu mẫu
            setNotifications([
                {
                    id: 1,
                    title: 'Đơn hàng mới',
                    description: 'Vừa nhận được đơn hàng mới',
                    time: new Date(),
                    read: false,
                },
                {
                    id: 2,
                    title: 'Thanh toán thành công',
                    description: 'Đơn hàng đã thanh toán',
                    time: new Date(Date.now() - 3600000),
                    read: false,
                },
                {
                    id: 3,
                    title: 'Sắp hết hàng',
                    description: 'Một số sản phẩm sắp hết hàng',
                    time: new Date(Date.now() - 86400000),
                    read: true,
                },
            ]);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await request.post('/users/logout');
            message.success('Đăng xuất thành công');
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            message.error('Đăng xuất thất bại');
        }
    };

    const getPageTitle = () => {
        switch (selectedKey) {
            case 'dashboard':
                return 'Tổng quan';
            case 'categories':
                return 'Quản lý danh mục';
            case 'products':
                return 'Quản lý sản phẩm';
            case 'orders':
                return 'Quản lý đơn hàng';
            case 'users':
                return 'Quản lý người dùng';
            case 'coupons':
                return 'Quản lý khuyến mãi';
            default:
                return 'Tổng quan';
        }
    };

    const renderContent = () => {
        switch (selectedKey) {
            case 'dashboard':
                return <Dashboard />;
            case 'categories':
                return <CategoryManagement />;
            case 'products':
                return <ProductManagement />;
            case 'orders':
                return <OrderManagement />;
            case 'users':
                return <UserManagement />;
            case 'coupons':
                return <CouponAdmin />;
            case 'question':
                return <QuestionManagement />;
            default:
                return <Dashboard />;
        }
    };

    const userMenuItems = [
        {
            key: 'profile',
            label: 'Thông tin cá nhân',
            onClick: () => message.info('Chức năng đang phát triển'),
        },
        {
            key: 'settings',
            label: 'Cài đặt tài khoản',
            onClick: () => message.info('Chức năng đang phát triển'),
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            label: 'Đăng xuất',
            danger: true,
            icon: <LogoutOutlined />,
            onClick: handleLogout,
        },
    ];

    const notificationItems = notifications.map((notification) => ({
        key: notification.id,
        label: (
            <div className={notification.read ? 'opacity-70' : ''}>
                <div className="font-medium">{notification.title}</div>
                <div className="text-xs text-gray-500">{notification.description}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(notification.time).toLocaleString()}</div>
            </div>
        ),
    }));

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Spin size="large" tip="Đang tải..." />
            </div>
        );
    }

    return (
        <Layout className="min-h-screen">
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                width={260}
                className="shadow-lg transition-all duration-300 overflow-auto"
                style={{
                    background: token.colorBgContainer,
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 10,
                }}
            >
                <div className="h-16 flex items-center justify-center border-b">
                    {!collapsed && (
                        <Title level={4} className="m-0 text-primary">
                            Food Admin
                        </Title>
                    )}
                    {collapsed && (
                        <Title level={3} className="m-0">
                            🍔
                        </Title>
                    )}
                </div>
                <Sidebar selectedKey={selectedKey} onSelect={setSelectedKey} />
            </Sider>
            <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'all 0.2s' }}>
                <Header
                    style={{
                        padding: '0 16px',
                        background: token.colorBgContainer,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 9,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <div className="flex items-center">
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{ fontSize: '16px', width: 64, height: 64 }}
                        />
                        <Title level={4} style={{ margin: 0 }}>
                            {getPageTitle()}
                        </Title>
                    </div>
                </Header>
                <Content
                    className="p-6"
                    style={{
                        background: '#f5f5f5',
                        minHeight: 'calc(100vh - 64px)',
                    }}
                >
                    {renderContent()}
                </Content>
            </Layout>
        </Layout>
    );
}

export default DashBroad;
