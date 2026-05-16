import { useEffect, useState } from 'react';
import { requestGetFavouriteProducts } from '../../config/request';

function FavouriteProduct() {
    const [favouriteProducts, setFavouriteProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavouriteProducts = async () => {
            try {
                setLoading(true);
                const res = await requestGetFavouriteProducts();
                setFavouriteProducts(res.metadata);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching favourite products:', error);
                setLoading(false);
            }
        };
        fetchFavouriteProducts();
    }, []);

    const handleRemoveFromFavorites = (productId) => {
        // Implement remove from favorites functionality here
        console.log('Remove product from favorites:', productId);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gradient-to-b from-gray-50 to-white">
            {favouriteProducts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm max-w-2xl mx-auto">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 text-gray-400 mx-auto mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                    <p className="text-gray-500 text-lg">Bạn chưa có sản phẩm yêu thích nào.</p>
                    <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition transform hover:scale-105 shadow-md">
                        Khám phá sản phẩm
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 w-full mx-auto">
                    {favouriteProducts.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
                        >
                            <div className="relative h-56 overflow-hidden">
                                <img
                                    src={item.product.productImage}
                                    alt={item.product.productName}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <button
                                    onClick={() => handleRemoveFromFavorites(item.productId)}
                                    className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-red-50 transition-all duration-300 transform hover:scale-110"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-red-500"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                    </svg>
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <p className="text-white font-bold text-lg truncate">{item.product.productName}</p>
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-semibold text-xl text-gray-800 hover:text-blue-600 transition-colors duration-300 truncate">
                                        {item.product.productName}
                                    </h3>
                                    <span className="bg-red-100 text-red-600 font-bold px-3 py-1 rounded-full text-sm">
                                        {item.product.productPrice.toLocaleString('vi-VN')}đ
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10">
                                    {item.product.productDescription}
                                </p>

                                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                    <button
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center gap-2 shadow-sm"
                                        onClick={() => (window.location.href = `/product/${item.productId}`)}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        </svg>
                                        Chi tiết
                                    </button>
                                    <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors duration-300 flex items-center gap-2 shadow-sm">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                            />
                                        </svg>
                                        Thêm vào giỏ
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FavouriteProduct;
