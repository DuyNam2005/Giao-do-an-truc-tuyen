import { Form, Input, Button, Select, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { requestRegister } from '../config/request';
import { toast, ToastContainer } from 'react-toastify';

function Register() {
    const [form] = Form.useForm();

    const navigate = useNavigate();

    const onFinish = async (values) => {
        console.log('Form values:', values);
        // Kiểm tra mật khẩu trùng khớp
        if (values.password !== values.confirmPassword) {
            message.error('Mật khẩu xác nhận không khớp!');
            return;
        }
        try {
            await requestRegister(values);
            toast.success('Đăng ký thành công!');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            navigate('/');
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <header>
                <Header />
            </header>

            <main className="flex-grow bg-[#f7f7f9] py-10">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Đăng ký tài khoản</h2>
                        <p className="text-gray-500 text-sm mt-1">Điền thông tin để tạo tài khoản mới</p>
                    </div>

                    <Form
                        form={form}
                        name="register"
                        layout="vertical"
                        onFinish={onFinish}
                        autoComplete="off"
                        size="large"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                            <Form.Item
                                name="fullName"
                                label="Họ và tên"
                                rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                            >
                                <Input
                                    prefix={<UserOutlined className="text-gray-400" />}
                                    placeholder="Họ và tên"
                                    className="rounded-lg py-2"
                                />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email!' },
                                    { type: 'email', message: 'Email không hợp lệ!' },
                                ]}
                            >
                                <Input
                                    prefix={<MailOutlined className="text-gray-400" />}
                                    placeholder="Email"
                                    className="rounded-lg py-2"
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label="Mật khẩu"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined className="text-gray-400" />}
                                    placeholder="Mật khẩu"
                                    className="rounded-lg py-2"
                                />
                            </Form.Item>

                            <Form.Item
                                name="confirmPassword"
                                label="Xác nhận mật khẩu"
                                dependencies={['password']}
                                rules={[
                                    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined className="text-gray-400" />}
                                    placeholder="Xác nhận mật khẩu"
                                    className="rounded-lg py-2"
                                />
                            </Form.Item>

                            <Form.Item
                                name="phone"
                                label="Số điện thoại"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                    { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' },
                                ]}
                            >
                                <Input
                                    prefix={<PhoneOutlined className="text-gray-400" />}
                                    placeholder="Số điện thoại"
                                    className="rounded-lg py-2"
                                />
                            </Form.Item>

                            <Form.Item
                                name="address"
                                label="Địa chỉ"
                                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                            >
                                <Input
                                    prefix={<HomeOutlined className="text-gray-400" />}
                                    placeholder="Địa chỉ"
                                    className="rounded-lg py-2"
                                />
                            </Form.Item>

                            <Form.Item name="typeLogin" label="Loại đăng nhập" initialValue="email" hidden>
                                <Select>
                                    <Select.Option value="email">Email</Select.Option>
                                    <Select.Option value="google">Google</Select.Option>
                                </Select>
                            </Form.Item>
                        </div>

                        <Form.Item className="mt-4">
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="w-full !bg-[#ee4d2d] hover:!bg-[#d84315] !rounded-lg !h-12 !font-medium !text-base"
                            >
                                Đăng ký
                            </Button>
                        </Form.Item>

                        <div className="text-center mt-4">
                            <span className="text-gray-500">Đã có tài khoản? </span>
                            <Link to="/login" className="text-[#ee4d2d] hover:text-[#d84315] font-medium">
                                Đăng nhập ngay
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

export default Register;
