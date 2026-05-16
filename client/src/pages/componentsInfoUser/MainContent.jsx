import React from 'react';
import PersonalInfo from './PersonalInfo';
import OrderManagement from './OrderManagement';
import ReviewsManagement from './ReviewsManagement';
import FavouriteProduct from './FavouriteProduct';

function MainContent({ activeKey }) {
    const renderContent = () => {
        switch (activeKey) {
            case 'personal-info':
                return <PersonalInfo />;
            case 'orders':
                return <OrderManagement />;
            case 'reviews':
                return <ReviewsManagement />;
            case 'favourites':
                return <FavouriteProduct />;
            default:
                return <PersonalInfo />;
        }
    };

    return <div className="flex-1">{renderContent()}</div>;
}

export default MainContent;
