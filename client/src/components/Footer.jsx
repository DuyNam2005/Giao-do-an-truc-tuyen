import { FaFacebook, FaInstagram, FaTwitter, FaTiktok } from 'react-icons/fa';
import { MdDeliveryDining, MdSupportAgent, MdLocalOffer } from 'react-icons/md';
import { HiLocationMarker, HiMail, HiPhone } from 'react-icons/hi';

function Footer() {
    return (
        <footer className="bg-gray-50 border-t border-gray-200 mt-10 pt-10 pb-6">
            <div className="container mx-auto px-4">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Column 1: About */}

                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <img
                                src="NamFood.png"
                                alt="logo"
                                className="w-10 h-10 rounded-full object-cover border-2 border-[#ee4d2d]"
                            />
                            <span className="text-xl font-bold text-[#ee4d2d]">Nam Food</span>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Nam Food nhanh chóng, tiện lợi và chất lượng đến tận tay bạn!
                        </p>
                        <div className="flex space-x-4 mb-4">
                            <a
                                href="#"
                                className="bg-[#ee4d2d] text-white p-2 rounded-full hover:bg-[#d43b1d] transition-all transform hover:scale-110"
                            >
                                <FaFacebook size={18} />
                            </a>
                            <a
                                href="#"
                                className="bg-[#ee4d2d] text-white p-2 rounded-full hover:bg-[#d43b1d] transition-all transform hover:scale-110"
                            >
                                <FaInstagram size={18} />
                            </a>
                            <a
                                href="#"
                                className="bg-[#ee4d2d] text-white p-2 rounded-full hover:bg-[#d43b1d] transition-all transform hover:scale-110"
                            >
                                <FaTwitter size={18} />
                            </a>
                            <a
                                href="#"
                                className="bg-[#ee4d2d] text-white p-2 rounded-full hover:bg-[#d43b1d] transition-all transform hover:scale-110"
                            >
                                <FaTiktok size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b-2 border-[#ee4d2d] inline-block pb-1">
                            Liên Kết Nhanh
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="#"
                                    className="text-gray-600 hover:text-[#ee4d2d] hover:font-medium transition-all flex items-center"
                                >
                                    <span className="mr-2">›</span> Trang chủ
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-gray-600 hover:text-[#ee4d2d] hover:font-medium transition-all flex items-center"
                                >
                                    <span className="mr-2">›</span> Thực đơn
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-gray-600 hover:text-[#ee4d2d] hover:font-medium transition-all flex items-center"
                                >
                                    <span className="mr-2">›</span> Về chúng tôi
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-gray-600 hover:text-[#ee4d2d] hover:font-medium transition-all flex items-center"
                                >
                                    <span className="mr-2">›</span> Liên hệ
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-gray-600 hover:text-[#ee4d2d] hover:font-medium transition-all flex items-center"
                                >
                                    <span className="mr-2">›</span> Blogs & Tin tức
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Contact */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b-2 border-[#ee4d2d] inline-block pb-1">
                            Liên Hệ
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <HiLocationMarker className="text-[#ee4d2d] mt-1 mr-3 flex-shrink-0" size={18} />
                                <span className="text-gray-600">Phường Nhân Hòa, Thị xã Nhân Hòa, TP. Hưng Yên</span>
                            </li>
                            <li className="flex items-center">
                                <HiPhone className="text-[#ee4d2d] mr-3 flex-shrink-0" size={18} />
                                <span className="text-gray-600">0123 456 789</span>
                            </li>
                            <li className="flex items-center">
                                <HiMail className="text-[#ee4d2d] mr-3 flex-shrink-0" size={18} />
                                <span className="text-gray-600">contact@giaodoan.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Features */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b-2 border-[#ee4d2d] inline-block pb-1">
                            Dịch Vụ
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-center">
                                <MdDeliveryDining className="text-[#ee4d2d] mr-3" size={20} />
                                <span className="text-gray-600">Giao hàng nhanh chóng</span>
                            </li>
                            <li className="flex items-center">
                                <MdLocalOffer className="text-[#ee4d2d] mr-3" size={20} />
                                <span className="text-gray-600">Khuyến mãi hấp dẫn</span>
                            </li>
                            <li className="flex items-center">
                                <MdSupportAgent className="text-[#ee4d2d] mr-3" size={20} />
                                <span className="text-gray-600">Hỗ trợ 24/7</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-6"></div>

                {/* Bottom Footer */}
                <div className="flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
                    <div className="mb-3 md:mb-0">
                        © {new Date().getFullYear()} Nam Food. Tất cả các quyền được bảo lưu.
                    </div>
                    <div className="flex space-x-4">
                        <a href="#" className="hover:text-[#ee4d2d]">
                            Điều khoản sử dụng
                        </a>
                        <a href="#" className="hover:text-[#ee4d2d]">
                            Chính sách bảo mật
                        </a>
                        <a href="#" className="hover:text-[#ee4d2d]">
                            Cookie
                        </a>
                    </div>
                </div>
            </div>
            <div className="w-[80%] mx-auto">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.9551039697257!2d106.70969107589484!3d10.732614489407024!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f9f78095295%3A0x8204231adcba8db3!2zMTUgTmd1eeG7hW4gTMawxqFuZyBC4bqxbmcsIFTDom4gUGjDuiwgUXXhuq1uIDcsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaA!5e0!3m2!1svi!2s!4v1692443232044!5m2!1svi!2s"
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Google Maps"
                    className="w-full"
                />
            </div>
        </footer>
    );
}

export default Footer;
