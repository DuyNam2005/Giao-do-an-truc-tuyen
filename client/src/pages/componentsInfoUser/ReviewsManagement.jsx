import React, { useEffect, useState } from 'react';
import { List, Rate, Avatar, Button, Modal, Form, Input, Tabs, Tag, Empty, Card } from 'antd';
import { DeleteOutlined, EditOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { requestDeletePreview, requestGetPreviewByUser, requestUpdatePreview } from '../../config/request';
import { toast } from 'react-toastify';

const { TextArea } = Input;

function ReviewsManagement() {
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [form] = Form.useForm();
    const [preview, setPreview] = useState([]);

    const fetchPreview = async () => {
        const res = await requestGetPreviewByUser();
        setPreview(res.metadata);
    };

    useEffect(() => {
        fetchPreview();
    }, []);

    const handleEdit = (review) => {
        setSelectedReview(review);
        form.setFieldsValue({
            rating: review.rating,
            comment: review.comment,
        });
        setEditModalVisible(true);
    };

    const handleDelete = (review) => {
        setSelectedReview(review);
        setDeleteModalVisible(true);
    };

    const handleEditSubmit = async () => {
        const data = {
            id: selectedReview.id,
            content: form.getFieldValue('comment'),
            rating: form.getFieldValue('rating'),
            productId: selectedReview.productId,
            userId: selectedReview.userId,
        };
        try {
            await requestUpdatePreview(data);
            toast.success('Cập nhật đánh giá thành công');
            setEditModalVisible(false);
            form.resetFields();
            const res = await requestGetPreviewByUser();
            setPreview(res.metadata);
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            await requestDeletePreview({ id: selectedReview.id });
            toast.success('Xóa đánh giá thành công');
            setDeleteModalVisible(false);
            const res = await requestGetPreviewByUser();
            setPreview(res.metadata);
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    const renderReviewItem = (item) => (
        <List.Item
            key={item.id}
            actions={[
                <Button
                    icon={<EditOutlined />}
                    type="text"
                    onClick={() => handleEdit(item)}
                    disabled={item.status === 'pending'}
                >
                    Sửa
                </Button>,
                <Button icon={<DeleteOutlined />} type="text" danger onClick={() => handleDelete(item)}>
                    Xóa
                </Button>,
            ]}
        >
            <List.Item.Meta
                avatar={<Avatar shape="square" size={64} src={item.productImage} />}
                title={
                    <div className="flex items-center justify-between">
                        <span>{item.productName}</span>
                    </div>
                }
                description={
                    <div>
                        <div className="mb-1">
                            <Rate disabled defaultValue={item.rating} />
                            <span className="text-xs text-gray-500 ml-2">{item.date}</span>
                        </div>
                        <p className="mb-1">{item.comment}</p>
                        <div className="text-xs text-gray-500">Mã đơn hàng: {item.orderId}</div>
                    </div>
                }
            />
        </List.Item>
    );

    const tabItems = [
        {
            key: 'all',
            label: 'Tất cả đánh giá',
            children:
                preview.length > 0 ? (
                    <List itemLayout="vertical" dataSource={preview} renderItem={renderReviewItem} />
                ) : (
                    <Empty description="Bạn chưa có đánh giá nào" />
                ),
        },
    ];

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-6">
                <h2 className="text-2xl font-bold">Quản lý đánh giá</h2>
                <p className="text-gray-500">Xem và quản lý đánh giá của bạn về các sản phẩm đã mua</p>
            </div>

            <Tabs defaultActiveKey="all" items={tabItems} />

            <Modal
                title="Chỉnh sửa đánh giá"
                open={editModalVisible}
                onOk={handleEditSubmit}
                onCancel={() => setEditModalVisible(false)}
            >
                {selectedReview && (
                    <div className="mb-4">
                        <div className="flex items-center mb-3">
                            <Avatar shape="square" size={48} src={selectedReview.productImage} />
                            <div className="ml-3">
                                <h4 className="text-base font-medium">{selectedReview.productName}</h4>
                                <p className="text-xs text-gray-500">Mã đơn hàng: {selectedReview.orderId}</p>
                            </div>
                        </div>
                        <Form form={form} layout="vertical">
                            <Form.Item
                                name="rating"
                                label="Đánh giá"
                                rules={[{ required: true, message: 'Vui lòng đánh giá sản phẩm!' }]}
                            >
                                <Rate />
                            </Form.Item>
                            <Form.Item
                                name="comment"
                                label="Nhận xét"
                                rules={[{ required: true, message: 'Vui lòng nhập nhận xét!' }]}
                            >
                                <TextArea rows={4} placeholder="Nhận xét của bạn về sản phẩm..." />
                            </Form.Item>
                        </Form>
                    </div>
                )}
            </Modal>

            <Modal
                title="Xóa đánh giá"
                open={deleteModalVisible}
                onOk={handleDeleteConfirm}
                onCancel={() => setDeleteModalVisible(false)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
            >
                {selectedReview && (
                    <p>Bạn có chắc chắn muốn xóa đánh giá về sản phẩm "{selectedReview.productName}" không?</p>
                )}
            </Modal>
        </div>
    );
}

export default ReviewsManagement;
