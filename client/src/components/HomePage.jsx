import { useStore } from '../hooks/useStore';
import CardBody from './Cardbody';
import { useEffect, useState } from 'react';
import { requestGetProductByCategory } from '../config/request';
import { ToastContainer } from 'react-toastify';

function HomePage() {
    const { categories } = useStore();
    const [activeCategory, setActiveCategory] = useState('all');

    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            const res = await requestGetProductByCategory(activeCategory, 1, 10);
            setProducts(res?.metadata?.products);
        };
        fetchProducts();
    }, [activeCategory]);

    return (
        <div className="bg-[#f7f7f9] px-4 py-6">
            {/* Filter */}
            <div className="flex gap-3 mb-6">
                <button
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all shadow-sm
                            ${
                                activeCategory === 'all'
                                    ? 'bg-[#ee4d2d] text-white border-[#ee4d2d]'
                                    : 'bg-white text-[#ee4d2d] border-[#ee4d2d] hover:bg-[#fff0e6]'
                            }
                        `}
                    onClick={() => setActiveCategory('all')}
                >
                    Tất cả
                </button>
                {categories.map((category) => (
                    <>
                        <button
                            key={category.id}
                            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all shadow-sm
                            ${
                                activeCategory === category.id
                                    ? 'bg-[#ee4d2d] text-white border-[#ee4d2d]'
                                    : 'bg-white text-[#ee4d2d] border-[#ee4d2d] hover:bg-[#fff0e6]'
                            }
                        `}
                            onClick={() => setActiveCategory(category.id)}
                        >
                            {category.categoryName}
                        </button>
                    </>
                ))}
            </div>
            {/* Title & desc */}
            <div className="mb-2">
                <h2 className="text-xl font-bold text-gray-800">
                    {categories.find((category) => category.id === activeCategory)?.categoryName}
                </h2>
            </div>
            {/* Product grid */}
            {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mt-4">
                    {products.map((product, idx) => (
                        <CardBody key={idx} {...product} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500">Không có sản phẩm</div>
            )}
        </div>
    );
}

export default HomePage;
