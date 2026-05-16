import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Modal, Input, message, Select, Tabs } from 'antd';
import { SearchOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { requestAnswerRequestion, requestCloseRequestion, requestGetAllRequestion } from '../../config/request';
import { toast } from 'react-toastify';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

function QuestionManagement() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [answer, setAnswer] = useState('');
    const [searchText, setSearchText] = useState('');

    // Mock data
    const fetchData = async () => {
        const res = await requestGetAllRequestion();
        setQuestions(res.metadata);
    };
    useEffect(() => {
        fetchData();
        setLoading(false);
    }, []);

    // Handle answering a question
    const handleAnswer = async () => {
        if (!answer.trim()) {
            message.error('Vui lòng nhập câu trả lời');
            return;
        }

        try {
            const data = {
                questionId: currentQuestion.id,
                answer,
            };
            await requestAnswerRequestion(data);
            toast.success('Đã trả lời câu hỏi thành công');
            fetchData();
        } catch (error) {
            console.error('Error answering question:', error);
            toast.error('Đã xảy ra lỗi khi trả lời câu hỏi');
        }

        message.success('Đã trả lời câu hỏi thành công');
        setIsModalVisible(false);
        setAnswer('');
        setCurrentQuestion(null);
    };

    // Handle closing a question
    const handleCloseQuestion = async (record) => {
        try {
            const data = {
                questionId: record.id,
            };
            await requestCloseRequestion(data);
            message.success('Đã ẩn câu hỏi thành công');
        } catch (error) {
            console.error('Error closing question:', error);
            message.error('Đã xảy ra lỗi khi ẩn câu hỏi');
        }
    };

    // Filter questions based on search text
    const filteredQuestions = questions.filter(
        (q) =>
            q.question.toLowerCase().includes(searchText.toLowerCase()) ||
            q.title.toLowerCase().includes(searchText.toLowerCase()) ||
            (q.user?.name && q.user.name.toLowerCase().includes(searchText.toLowerCase())),
    );

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Người dùng',
            dataIndex: 'user',
            key: 'user',
            render: (user) => (
                <div>
                    <div className="font-medium">{user.fullName}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                </div>
            ),
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <div
                    className="font-medium cursor-pointer hover:text-blue-500"
                    onClick={() => {
                        setCurrentQuestion(record);
                        setAnswer(record.answer || '');
                        setIsModalVisible(true);
                    }}
                >
                    {text}
                </div>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => new Date(text).toLocaleDateString('vi-VN'),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'default';
                let text = '';
                let icon = null;

                switch (status) {
                    case 'pending':
                        color = 'gold';
                        text = 'Đang chờ';
                        icon = <ClockCircleOutlined />;
                        break;
                    case 'success':
                        color = 'green';
                        text = 'Đã trả lời';
                        icon = <CheckCircleOutlined />;
                        break;
                    case 'closed':
                        color = 'red';
                        text = 'Đã ẩn';
                        icon = <CloseCircleOutlined />;
                        break;
                    default:
                        text = status;
                }

                return (
                    <Tag color={color} icon={icon}>
                        {text}
                    </Tag>
                );
            },
            filters: [
                { text: 'Đang chờ', value: 'pending' },
                { text: 'Đã trả lời', value: 'success' },
                { text: 'Đã ẩn', value: 'closed' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <div className="space-x-2">
                    <Button
                        type="primary"
                        size="small"
                        onClick={() => {
                            setCurrentQuestion(record);
                            setAnswer(record.answer || '');
                            setIsModalVisible(true);
                        }}
                        disabled={record.status === 'closed'}
                    >
                        {record.status === 'pending' ? 'Trả lời' : 'Xem chi tiết'}
                    </Button>
                    {record.status !== 'closed' && (
                        <Button type="default" danger size="small" onClick={() => handleCloseQuestion(record)}>
                            Đóng
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Quản lý câu hỏi</h1>
                <p className="text-gray-500">Xem và trả lời các câu hỏi từ người dùng</p>
            </div>

            <div className="mb-4 flex justify-between items-center">
                <Input
                    placeholder="Tìm kiếm theo tiêu đề, nội dung hoặc người dùng"
                    prefix={<SearchOutlined />}
                    className="max-w-md"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <div className="text-right">
                    <span className="mr-2">
                        <Tag color="gold" icon={<ClockCircleOutlined />}>
                            Đang chờ: {questions.filter((q) => q.status === 'pending').length}
                        </Tag>
                    </span>
                    <span className="mr-2">
                        <Tag color="green" icon={<CheckCircleOutlined />}>
                            Đã trả lời: {questions.filter((q) => q.status === 'success').length}
                        </Tag>
                    </span>
                    <span>
                        <Tag color="red" icon={<CloseCircleOutlined />}>
                            Đã ẩn: {questions.filter((q) => q.status === 'closed').length}
                        </Tag>
                    </span>
                </div>
            </div>

            <Tabs defaultActiveKey="all">
                <TabPane tab="Tất cả câu hỏi" key="all">
                    <Table
                        columns={columns}
                        dataSource={filteredQuestions}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} câu hỏi`,
                        }}
                    />
                </TabPane>
                <TabPane tab={`Đang chờ (${questions.filter((q) => q.status === 'pending').length})`} key="pending">
                    <Table
                        columns={columns}
                        dataSource={filteredQuestions.filter((q) => q.status === 'pending')}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} câu hỏi`,
                        }}
                    />
                </TabPane>
                <TabPane tab={`Đã trả lời (${questions.filter((q) => q.status === 'success').length})`} key="success">
                    <Table
                        columns={columns}
                        dataSource={filteredQuestions.filter((q) => q.status === 'success')}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} câu hỏi`,
                        }}
                    />
                </TabPane>
                <TabPane tab={`Đã ẩn (${questions.filter((q) => q.status === 'closed').length})`} key="closed">
                    <Table
                        columns={columns}
                        dataSource={filteredQuestions.filter((q) => q.status === 'closed')}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} câu hỏi`,
                        }}
                    />
                </TabPane>
            </Tabs>

            {/* Modal for viewing and answering questions */}
            <Modal
                title={currentQuestion?.title || 'Chi tiết câu hỏi'}
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    setCurrentQuestion(null);
                    setAnswer('');
                }}
                footer={[
                    <Button
                        key="close"
                        onClick={() => {
                            setIsModalVisible(false);
                            setCurrentQuestion(null);
                            setAnswer('');
                        }}
                    >
                        Đóng
                    </Button>,
                    currentQuestion?.status !== 'closed' && (
                        <Button key="submit" type="primary" onClick={handleAnswer}>
                            {currentQuestion?.status === 'pending' ? 'Trả lời' : 'Cập nhật trả lời'}
                        </Button>
                    ),
                    currentQuestion?.status !== 'closed' && (
                        <Button
                            key="close-question"
                            type="default"
                            danger
                            onClick={() => {
                                handleCloseQuestion(currentQuestion);
                                setIsModalVisible(false);
                                setCurrentQuestion(null);
                                setAnswer('');
                            }}
                        >
                            Ẩn câu hỏi
                        </Button>
                    ),
                ].filter(Boolean)}
                width={700}
            >
                {currentQuestion && (
                    <div>
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex justify-between mb-2">
                                <div className="font-medium">{currentQuestion.user?.fullName} </div>
                                <div className="text-gray-500 text-sm">
                                    {new Date(currentQuestion.createdAt).toLocaleString('vi-VN')}
                                </div>
                            </div>
                            <div className="whitespace-pre-wrap">{currentQuestion.question}</div>
                        </div>

                        <div className="mb-4">
                            <div className="font-medium mb-2">Trả lời:</div>
                            <TextArea
                                rows={6}
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="Nhập câu trả lời của bạn ở đây..."
                                disabled={currentQuestion.status === 'closed'}
                            />
                        </div>

                        <div className="flex justify-between items-center">
                            <div>
                                <span className="mr-2">Trạng thái:</span>
                                <Tag
                                    color={
                                        currentQuestion.status === 'pending'
                                            ? 'gold'
                                            : currentQuestion.status === 'success'
                                            ? 'green'
                                            : 'red'
                                    }
                                >
                                    {currentQuestion.status === 'pending'
                                        ? 'Đang chờ'
                                        : currentQuestion.status === 'success'
                                        ? 'Đã trả lời'
                                        : 'Đã ẩn'}
                                </Tag>
                            </div>
                            {currentQuestion.adminId && currentQuestion.status !== 'pending' && (
                                <div className="text-gray-500 text-sm">
                                    Trả lời bởi: Admin ID {currentQuestion.adminId}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default QuestionManagement;
