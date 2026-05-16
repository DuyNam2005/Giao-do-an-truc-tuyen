import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Collapse, Divider, Avatar, Tag, Space } from 'antd';
import { SendOutlined, QuestionCircleOutlined, UserOutlined, CheckCircleOutlined } from '@ant-design/icons';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { requestCreateRequestion, requestGetAllRequestion } from '../config/request';
import { toast } from 'react-toastify';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

function Question() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await requestGetAllRequestion();
                setData(res.metadata || []);
            } catch (error) {
                toast.error('Không thể tải câu hỏi, vui lòng thử lại sau');
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const data = {
                title: values.subject,
                question: values.question,
            };
            await requestCreateRequestion(data);
            toast.success('Câu hỏi của bạn đã được gửi thành công!');
            form.resetFields();

            // Refresh questions list after submitting
            const res = await requestGetAllRequestion();
            setData(res.metadata || []);
        } catch (error) {
            toast.error('Đã có lỗi xảy ra, vui lòng thử lại sau!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <header>
                <Header />
            </header>

            <main className="flex-grow py-8 px-4 md:px-8 lg:px-16 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-10">
                        <Title level={2} className="!text-3xl font-bold text-blue-800">
                            Câu Hỏi Thường Gặp
                        </Title>
                        <Paragraph className="text-gray-600 max-w-2xl mx-auto">
                            Tìm câu trả lời cho những câu hỏi phổ biến hoặc gửi câu hỏi mới nếu bạn không tìm thấy thông
                            tin cần thiết.
                        </Paragraph>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* FAQ Questions Section */}
                        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center mb-4">
                                <QuestionCircleOutlined className="text-blue-600 text-xl mr-2" />
                                <Title level={3} className="!text-xl !mb-0">
                                    Những câu hỏi phổ biến
                                </Title>
                            </div>
                            <Divider className="!my-3" />

                            {data.length === 0 ? (
                                <div className="text-center py-10">
                                    <Text type="secondary">Chưa có câu hỏi nào</Text>
                                </div>
                            ) : (
                                <Collapse
                                    className="bg-white border-0 shadow-none"
                                    expandIconPosition="end"
                                    bordered={false}
                                >
                                    {data
                                        .filter((item) => item.status !== 'closed')
                                        .map((faq) => (
                                            <Panel
                                                key={faq.id}
                                                header={
                                                    <div className="flex justify-between items-center w-full">
                                                        <span className="font-medium text-gray-800">
                                                            {faq.title || faq.question}
                                                        </span>
                                                        <Tag color="blue" className="ml-2 hidden md:inline-block">
                                                            {faq.user?.date || 'Gần đây'}
                                                        </Tag>
                                                    </div>
                                                }
                                                className="mb-4 border border-gray-200 rounded-md overflow-hidden"
                                            >
                                                <div className="mb-4 pb-3 border-b border-gray-100">
                                                    <div className="flex items-start">
                                                        <Avatar
                                                            src={faq.user?.avatar}
                                                            icon={<UserOutlined />}
                                                            size={40}
                                                            className="flex-shrink-0"
                                                        />
                                                        <div className="ml-3 flex-grow">
                                                            <div className="flex items-center flex-wrap">
                                                                <Text strong className="text-blue-700">
                                                                    {faq.user?.fullName || 'Người dùng'}
                                                                </Text>
                                                                <Text type="secondary" className="ml-2 text-xs">
                                                                    {faq.user?.date || 'Gần đây'}
                                                                </Text>
                                                            </div>
                                                            <div className="mt-2 bg-gray-50 p-3 rounded-lg">
                                                                <Text>{faq.question}</Text>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {faq.answer && (
                                                    <div className="mt-3">
                                                        <div className="flex items-start">
                                                            <Avatar
                                                                src={faq.admin?.avatar}
                                                                icon={<UserOutlined />}
                                                                size={40}
                                                                className="flex-shrink-0"
                                                                style={{ backgroundColor: '#52c41a' }}
                                                            />
                                                            <div className="ml-3 flex-grow">
                                                                <div className="flex items-center flex-wrap">
                                                                    <Text strong className="text-green-700">
                                                                        {faq.admin?.fullName || 'Quản trị viên'}
                                                                    </Text>
                                                                    <CheckCircleOutlined className="text-green-500 ml-1" />
                                                                    <Text type="secondary" className="ml-2 text-xs">
                                                                        {faq.admin?.date || 'Gần đây'}
                                                                    </Text>
                                                                </div>
                                                                <div className="mt-2 bg-green-50 p-3 rounded-lg">
                                                                    <Text>{faq.answer}</Text>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Panel>
                                        ))}
                                </Collapse>
                            )}
                        </div>

                        {/* Ask Question Form Section */}
                        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
                            <div className="mb-4">
                                <Title level={3} className="!text-xl">
                                    Gửi câu hỏi của bạn
                                </Title>
                                <Paragraph className="text-gray-600">
                                    Bạn có thắc mắc khác? Hãy gửi câu hỏi cho chúng tôi và chúng tôi sẽ phản hồi trong
                                    thời gian sớm nhất.
                                </Paragraph>
                            </div>
                            <Divider className="!my-3" />
                            <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
                                <Form.Item
                                    name="subject"
                                    label="Tiêu đề"
                                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                                >
                                    <Input placeholder="Nhập tiêu đề câu hỏi" />
                                </Form.Item>
                                <Form.Item
                                    name="question"
                                    label="Nội dung câu hỏi"
                                    rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi!' }]}
                                >
                                    <TextArea placeholder="Nhập chi tiết câu hỏi của bạn..." rows={6} />
                                </Form.Item>
                                <Form.Item className="mb-0">
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        icon={<SendOutlined />}
                                        className="bg-blue-600 hover:bg-blue-700 w-full"
                                    >
                                        Gửi câu hỏi
                                    </Button>
                                </Form.Item>
                            </Form>
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

export default Question;
