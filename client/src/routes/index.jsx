import App from '../App';
import LoginUser from '../pages/LoginUser';
import Register from '../pages/Register';
import DetailProduct from '../pages/DetailProduct';
import CartUser from '../pages/CartUser';
import PaymentsSuccess from '../pages/PaymentsSuccess';
import InfoUser from '../pages/infoUser';
import DashBroad from '../pages/DashBroad';
import Driver from '../pages/Driver';
import Question from '../pages/Question';
import ForgotPassword from '../pages/ForgotPassword';

export const routes = [
    {
        path: '/',
        component: <App />,
    },
    {
        path: '/login',
        component: <LoginUser />,
    },
    {
        path: '/register',
        component: <Register />,
    },
    {
        path: '/product/:id',
        component: <DetailProduct />,
    },
    {
        path: '/cart',
        component: <CartUser />,
    },
    {
        path: '/payment-success/:id',
        component: <PaymentsSuccess />,
    },
    {
        path: '/profile',
        component: <InfoUser />,
    },
    {
        path: '/orders',
        component: <InfoUser />,
    },
    {
        path: '/admin',
        component: <DashBroad />,
    },
    {
        path: '/driver',
        component: <Driver />,
    },
    {
        path: '/question',
        component: <Question />,
    },
    {
        path: '/forgot-password',
        component: <ForgotPassword />,
    },
];
