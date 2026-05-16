const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyAdvvF4lYG5YTHboooYE3svXFsHaj5BosM');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const Product = require('../models/product.model'); // Sequelize model

async function searchFoodGemini(query) {
    try {
        // Lấy tất cả món ăn từ DB
        const foods = await Product.findAll({
            where: {
                productStatus: 'active', // chỉ lấy món đang hoạt động
            },
        });

        // Chuyển thành object thuần để truyền vào Gemini
        const plainFoods = foods.map((item) => item.get({ plain: true }));

        // Prompt cho Gemini
        const prompt = `
        Bạn là một trợ lý thông minh giúp tìm kiếm món ăn trong nhà hàng.
        Dưới đây là danh sách các món ăn đang có (dưới dạng JSON): ${JSON.stringify(plainFoods)}

        Người dùng muốn tìm món ăn với yêu cầu: "${query}"

        Hãy tìm các món phù hợp nhất dựa trên:
        - Tên món
        - Mô tả món
        - Giá cả

        Và trả về **chỉ một mảng JSON các ID (UUID)** của các món phù hợp.
        Ví dụ: ["f1e8c123-4abc-5678-9def-112233445566"]
        KHÔNG được trả về text, chỉ trả về mảng JSON.
        `;

        const response = await model.generateContent(prompt);
        let data = response.response.text();

        // Làm sạch dữ liệu trả về
        data = data.replace(/```json|```/g, '').trim();

        let foodIds;
        try {
            foodIds = JSON.parse(data);
        } catch (parseError) {
            const match = data.match(/\[.*?\]/);
            if (match) {
                foodIds = JSON.parse(match[0]);
            } else {
                console.error('Không thể parse food IDs:', data);
                return [];
            }
        }

        // Đảm bảo là mảng
        if (!Array.isArray(foodIds)) {
            console.error('foodIds không phải mảng:', foodIds);
            return [];
        }

        if (foodIds.length === 0) return [];

        // Tìm món ăn theo ID
        const foundFoods = await Product.findAll({
            where: {
                id: foodIds,
            },
        });

        return foundFoods;
    } catch (error) {
        console.error('Lỗi trong searchFoodGemini:', error);
        throw error;
    }
}

module.exports = searchFoodGemini;
