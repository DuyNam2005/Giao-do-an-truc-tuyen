import { Input, Button, Avatar, Dropdown, List, Image, Empty, Spin } from 'antd';
import { SearchOutlined, ShoppingCartOutlined, UserOutlined, QuestionOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

import { useStore } from '../hooks/useStore';

import useDebounce from '../hooks/useDebounce';
import { useEffect, useState, useRef } from 'react';
import { requestLogout, requestSearchProduct } from '../config/request';

function Header() {
    const { dataUser, cart } = useStore();
    const searchRef = useRef(null);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await requestLogout();
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            navigate('/');
        } catch (error) {
            console.log(error);
        }
    };

    const userMenuItems = [
        {
            key: '1',
            label: <Link to="/profile">Tài khoản của tôi</Link>,
        },
        {
            key: '2',
            label: <Link to="/orders">Đơn hàng</Link>,
        },
        {
            key: '3',
            label: <span onClick={handleLogout}>Đăng xuất</span>,
        },
    ];

    const [search, setSearch] = useState('');
    const debounce = useDebounce(search, 500);
    const [products, setProducts] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (debounce) {
                setLoading(true);
                try {
                    const res = await requestSearchProduct(debounce);
                    setProducts(res.metadata);
                    setShowResults(true);
                } catch (error) {
                    console.error('Search error:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setProducts([]);
                setShowResults(false);
            }
        };
        fetchData();
    }, [debounce]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <header className="w-full bg-[#ee4d2d] shadow-md">
            <div className="max-w-[80%] mx-auto flex items-center justify-between h-[72px] ">
                {/* Logo */}
                <Link to="/">
                    <div className="flex items-center">
                        <img
                            src="NamFood.png"
                            alt="logo"
                            className="w-[56px] h-[56px] object-cover rounded-full shadow-lg border-2 border-white bg-white"
                        />
                        <span className="ml-3 text-white text-2xl font-bold tracking-wide hidden md:inline">
                            Nam Food
                        </span>
                    </div>
                </Link>
                {/* Search */}
                <div className="flex-1 flex justify-center px-2 relative" ref={searchRef}>
                    <Input
                        placeholder="Tìm kiếm món ăn, nhà hàng..."
                        allowClear
                        prefix={<SearchOutlined className="text-[#ee4d2d]" />}
                        className="rounded-full w-full max-w-[400px] h-11 shadow-sm border-none focus:shadow-lg"
                        size="small"
                        style={{ borderRadius: 9999 }}
                        onChange={(e) => setSearch(e.target.value)}
                        onFocus={() => setShowResults(products.length > 0)}
                    />

                    {showResults && (
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-full max-w-[450px] bg-white rounded-lg shadow-xl mt-2 z-50 overflow-hidden border border-gray-100">
                            <div className="p-3 bg-gradient-to-r from-[#ff6b3d] to-[#ee4d2d] text-white font-medium">
                                Kết quả tìm kiếm: {search}
                            </div>

                            {loading ? (
                                <div className="flex justify-center items-center py-8">
                                    <Spin size="large" />
                                </div>
                            ) : products.length > 0 ? (
                                <div className="max-h-[400px] overflow-y-auto">
                                    {products.map((item) => (
                                        <Link
                                            to={`/product/${item.id}`}
                                            onClick={() => setShowResults(false)}
                                            key={item.id}
                                        >
                                            <div className="flex p-3 hover:bg-gray-50 border-b border-gray-100 transition-all duration-200">
                                                <div className="w-[80px] h-[80px] rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                                    <img
                                                        src={item.productImage}
                                                        alt={item.productName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="ml-3 flex-1">
                                                    <h3 className="font-medium text-[#ee4d2d] line-clamp-1">
                                                        {item.productName}
                                                    </h3>
                                                    <div className="flex items-center mt-1">
                                                        <span className="text-red-500 font-bold">
                                                            {formatPrice(item.productPrice)}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                                                        {item.productDescription}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8">
                                    <Empty description="Không tìm thấy sản phẩm" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {/* Buttons or User Profile */}

                <div className="flex gap-3">
                    {dataUser && dataUser.id && (
                        <div className="flex gap-2">
                            <Link to="/question">
                                <Button
                                    type="primary"
                                    className="!bg-white !text-[#ee4d2d] !rounded-full !font-semibold !px-4 !h-11 hover:!bg-[#fff0e6] hover:!text-[#ee4d2d] shadow"
                                >
                                    <QuestionOutlined style={{ fontSize: 20 }} />
                                    <span className="text-sm">Câu hỏi thường gặp</span>
                                </Button>
                            </Link>
                            <Link to="/cart">
                                <Button
                                    type="primary"
                                    className="!bg-white !text-[#ee4d2d] !rounded-full !font-semibold !px-4 !h-11 hover:!bg-[#fff0e6] hover:!text-[#ee4d2d] shadow"
                                >
                                    <ShoppingCartOutlined style={{ fontSize: 20 }} />
                                    <span className="text-sm">
                                        Đơn hàng của tôi <span className="text-red-500">({cart?.cart?.length})</span>
                                    </span>
                                </Button>
                            </Link>
                        </div>
                    )}

                    {dataUser && dataUser.id ? (
                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                            <div className="flex items-center gap-2 cursor-pointer">
                                <Avatar size="large" icon={<UserOutlined />} className="border-2 border-white" />
                                <span className="text-white font-medium">{dataUser.fullName || 'Người dùng'}</span>
                            </div>
                        </Dropdown>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button
                                    type="primary"
                                    className="!bg-white !text-[#ee4d2d] !rounded-full !font-semibold !px-4 !h-11 hover:!bg-[#fff0e6] hover:!text-[#ee4d2d] shadow"
                                    size="small"
                                >
                                    Đăng nhập
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button
                                    type="default"
                                    className="!bg-[#ee4d2d] !text-white !border-white !rounded-full !font-semibold !px-6 !h-11 hover:!bg-[#d84315] hover:!text-white shadow"
                                    size="small"
                                >
                                    Đăng ký
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
