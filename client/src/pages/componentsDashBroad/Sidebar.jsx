import React from 'react';
import { Menu, Badge } from 'antd';
import {
    AppstoreOutlined,
    ShoppingOutlined,
    UserOutlined,
    DashboardOutlined,
    TagOutlined,
    ShoppingCartOutlined,
    SettingOutlined,
    LogoutOutlined,
    QuestionCircleOutlined,
} from '@ant-design/icons';

const Sidebar = ({ selectedKey, onSelect }) => {
    const menuItems = [
        {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: 'Tổng quan',
        },
        {
            key: 'categories',
            icon: <AppstoreOutlined />,
            label: 'Quản lý danh mục',
        },
        {
            key: 'products',
            icon: <ShoppingOutlined />,
            label: 'Quản lý sản phẩm',
        },
        {
            key: 'orders',
            icon: <ShoppingCartOutlined />,
            label: (
                <div className="flex items-center justify-between w-full">
                    <span>Quản lý đơn hàng</span>
                </div>
            ),
        },
        {
            key: 'users',
            icon: <UserOutlined />,
            label: 'Quản lý người dùng',
        },
        {
            key: 'coupons',
            icon: <TagOutlined />,
            label: 'Quản lý khuyến mãi',
        },
        {
            key: 'question',
            icon: <QuestionCircleOutlined />,
            label: 'Quản lý câu hỏi',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            danger: true,
        },
    ];

    return (
        <div className="h-[calc(100%-64px)]">
            <Menu
                mode="inline"
                selectedKeys={[selectedKey]}
                onClick={(e) => onSelect(e.key)}
                items={menuItems}
                className="border-r-0 h-full"
                style={{
                    fontSize: '14px',
                    padding: '8px 0',
                }}
            />
        </div>
    );
};

export default Sidebar;
