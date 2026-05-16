import React from 'react';
import { Menu } from 'antd';
import { UserOutlined, ShoppingCartOutlined, LogoutOutlined } from '@ant-design/icons';

function Sidebar({ activeKey, setActiveKey }) {
    const items = [
        {
            key: 'personal-info',
            icon: <UserOutlined />,
            label: 'Thông tin cá nhân',
        },
        {
            key: 'order-management',
            icon: <ShoppingCartOutlined />,
            label: 'Quản lý đơn hàng',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            danger: true,
        },
    ];

    return (
        <div className="h-full bg-white shadow-md">
            <div className="p-4 border-b">
                <h1 className="text-xl font-bold text-center">Tài xế giao hàng</h1>
            </div>
            <Menu
                mode="inline"
                selectedKeys={[activeKey]}
                items={items}
                className="h-full"
                onClick={({ key }) => setActiveKey(key)}
            />
        </div>
    );
}

export default Sidebar;
