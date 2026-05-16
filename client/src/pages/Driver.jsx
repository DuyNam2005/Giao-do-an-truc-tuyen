import React, { useState } from 'react';
import { Layout } from 'antd';
import Sidebar from './componentsDriver/Sidebar';
import PersonalInfo from './componentsDriver/PersonalInfo';
import OrderManagement from './componentsDriver/OrderManagement';

const { Sider, Content } = Layout;

function Driver() {
    const [activeKey, setActiveKey] = useState('personal-info');

    const renderContent = () => {
        switch (activeKey) {
            case 'personal-info':
                return <PersonalInfo />;
            case 'order-management':
                return <OrderManagement />;
            default:
                return <PersonalInfo />;
        }
    };

    return (
        <Layout className="min-h-screen bg-gray-100">
            <Sider width={250} theme="light" className="shadow-md">
                <Sidebar activeKey={activeKey} setActiveKey={setActiveKey} />
            </Sider>
            <Content className="p-6">{renderContent()}</Content>
        </Layout>
    );
}

export default Driver;
