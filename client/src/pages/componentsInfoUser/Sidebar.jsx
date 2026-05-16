import React from 'react';
import { Menu, Button } from 'antd';
import { UserOutlined, ShoppingOutlined, StarOutlined, LogoutOutlined } from '@ant-design/icons';
import { useStore } from '../../hooks/useStore';

function Sidebar({ activeKey, setActiveKey }) {
    const { dataUser } = useStore();

    const menuItems = [
        {
            key: 'personal-info',
            icon: <UserOutlined />,
            label: 'Thông tin cá nhân',
        },
        {
            key: 'orders',
            icon: <ShoppingOutlined />,
            label: 'Quản lý đơn hàng',
        },
        {
            key: 'reviews',
            icon: <StarOutlined />,
            label: 'Quản lý đánh giá',
        },
        {
            key: 'favourites',
            icon: <StarOutlined />,
            label: 'Sản phẩm yêu thích',
        },
    ];

    const handleMenuClick = (e) => {
        setActiveKey(e.key);
    };

    const handleLogout = () => {
        console.log('Logged out');
        // Implement actual logout logic here
    };

    return (
        <div className="h-full bg-white shadow-md rounded-lg p-4">
            <div className="flex flex-col items-center mb-6 pt-3">
                <div className="w-20 h-20 rounded-full bg-gray-200 mb-3 overflow-hidden">
                    <img src={dataUser.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-lg font-medium">{dataUser.fullName}</h3>
                <p className="text-gray-500 text-sm">{dataUser.email}</p>
            </div>

            <Menu
                mode="inline"
                selectedKeys={[activeKey]}
                onClick={handleMenuClick}
                items={menuItems}
                className="border-r-0"
            />

            <div className="mt-auto pt-6">
                <Button
                    type="text"
                    danger
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    className="w-full flex items-center justify-start"
                >
                    Đăng xuất
                </Button>
            </div>
        </div>
    );
}

export default Sidebar;
