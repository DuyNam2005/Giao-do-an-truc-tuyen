import Context from './Context';
import CryptoJS from 'crypto-js';

import cookies from 'js-cookie';

import { useEffect, useState } from 'react';
import { requestAuth, requestGetCart, requestGetCategories } from '../config/request';
import { io } from 'socket.io-client';
import DriverNotication from '../components/Notication/DriverNotication';
import { toast, ToastContainer } from 'react-toastify';
import SuccessNotication from '../components/Notication/SuccessNotication';
import NewOrder from '../components/Notication/NewOrder';

export function Provider({ children }) {
    const [dataUser, setDataUser] = useState({});
    const [categories, setCategories] = useState([]);
    const [cart, setCart] = useState([]);
    const [dataStatus, setDataStatus] = useState({});
    const [isOpen, setIsOpen] = useState(false);
    const [driver, setDriver] = useState({});
    const [dataSuccess, setDataSuccess] = useState({});
    const [dataNewOrder, setDataNewOrder] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const socket = io(import.meta.env.VITE_API_URL, {
            withCredentials: true, // Cho phép gửi cookie
        });

        socket.on('shipping', (data) => {
            if (data.status === 'shipping' && data.idUser === dataUser.id) {
                setIsOpen(true);
                setDriver(data.driver);
            }
        });

        socket.on('confirm', (data) => {
            if (data.status === 'confirm' && data.idUser === dataUser.id) {
                toast.success('Đơn hàng đã xác nhận thành công');
            }
        });

        socket.on('new-order', (data) => {
            if (dataUser.role === 'admin') {
                setDataNewOrder(data);
                setIsModalOpen(true);
            }
        });

        socket.on('success', (data) => {
            if (data.status === 'success' && data.idUser === dataUser.id) {
                toast.success('Đơn hàng đã giao thành công');
                setDataSuccess(data);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [dataUser]);

    const fetchAuth = async () => {
        try {
            const res = await requestAuth();
            const bytes = CryptoJS.AES.decrypt(res.metadata, import.meta.env.VITE_SECRET_CRYPTO);
            const originalText = bytes.toString(CryptoJS.enc.Utf8);
            if (!originalText) {
                console.error('Failed to decrypt data');
                return;
            }
            const user = JSON.parse(originalText);
            setDataUser(user);
        } catch (error) {
            console.error('Auth error:', error);
        }
    };

    const fetchCart = async () => {
        const res = await requestGetCart();
        setCart(res.metadata);
    };

    const fetchCategories = async () => {
        const res = await requestGetCategories();
        setCategories(res.metadata);
    };

    useEffect(() => {
        fetchCategories();
        const token = cookies.get('logged');

        if (!token) {
            return;
        }
        fetchAuth();
        fetchCart();
    }, []);

    return (
        <>
            <Context.Provider
                value={{
                    dataUser,
                    fetchAuth,
                    categories,
                    fetchCategories,
                    cart,
                    dataStatus,
                    fetchCart,
                }}
            >
                {children}
                <DriverNotication isOpen={isOpen} onClose={() => setIsOpen(false)} driver={driver} />
                <NewOrder data={dataNewOrder.dataPayment} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
                <SuccessNotication
                    isOpen={dataSuccess.status === 'success' ? true : false}
                    onClose={() => setDataSuccess({})}
                    orderData={dataSuccess.dataProduct}
                    dataPayment={dataSuccess.dataPayment}
                />
                <ToastContainer />
            </Context.Provider>
        </>
    );
}
