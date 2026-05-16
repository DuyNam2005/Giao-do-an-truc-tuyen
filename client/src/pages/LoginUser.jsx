import { Form, Input, Button, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { requestLogin, requestLoginGoogle } from '../config/request';
import { toast, ToastContainer } from 'react-toastify';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function LoginUser() {
    const [form] = Form.useForm();

    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            await requestLogin(values);
            toast.success('Đăng nhập thành công!');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            navigate('/');
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    const handleSuccess = async (response) => {
        const { credential } = response; // Nhận ID Token từ Google
        try {
            await requestLoginGoogle({ credential });
            message.success('Đăng nhập thành công!');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            navigate('/');
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                message.error(error.response.data.message);
            } else {
                message.error('Đăng nhập bằng Google thất bại. Vui lòng thử lại!');
            }
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <header>
                <Header />
            </header>

            <main className="flex-grow bg-[#f7f7f9] py-10">
                <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Đăng nhập</h2>
                        <p className="text-gray-500 text-sm mt-1">Chào mừng bạn quay trở lại!</p>
                    </div>

                    <Form
                        form={form}
                        name="login"
                        layout="vertical"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        autoComplete="off"
                        size="large"
                    >
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' },
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined className="text-gray-400" />}
                                placeholder="Email"
                                className="rounded-lg py-2"
                            />
                        </Form.Item>

                        <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
                            <Input.Password
                                prefix={<LockOutlined className="text-gray-400" />}
                                placeholder="Mật khẩu"
                                className="rounded-lg py-2"
                            />
                        </Form.Item>

                        <Form.Item>
                            <div className="flex justify-between items-center">
                                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                                <Link to="/forgot-password" className="text-[#ee4d2d] hover:text-[#d84315] text-sm">
                                    Quên mật khẩu?
                                </Link>
                            </div>
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="w-full !bg-[#ee4d2d] hover:!bg-[#d84315] !rounded-lg !h-12 !font-medium !text-base"
                            >
                                Đăng nhập
                            </Button>
                        </Form.Item>

                        <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID}>
                            <GoogleLogin onSuccess={handleSuccess} onError={() => console.log('Login Failed')} />
                        </GoogleOAuthProvider>

                        <div className="text-center mt-4">
                            <span className="text-gray-500">Bạn chưa có tài khoản? </span>
                            <Link to="/register" className="text-[#ee4d2d] hover:text-[#d84315] font-medium">
                                Đăng ký ngay
                            </Link>
                        </div>
                    </Form>
                </div>
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default LoginUser;
