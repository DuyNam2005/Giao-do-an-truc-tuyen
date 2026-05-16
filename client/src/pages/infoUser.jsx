import React, { useState } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Sidebar from './componentsInfoUser/Sidebar';
import MainContent from './componentsInfoUser/MainContent';

function InfoUser() {
    const [activeKey, setActiveKey] = useState('personal-info');

    return (
        <div className="min-h-screen flex flex-col">
            <header>
                <Header />
            </header>

            <main className="flex-1 bg-gray-100 py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/4">
                            <Sidebar activeKey={activeKey} setActiveKey={setActiveKey} />
                        </div>
                        <div className="w-full md:w-3/4">
                            <MainContent activeKey={activeKey} />
                        </div>
                    </div>
                </div>
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default InfoUser;
