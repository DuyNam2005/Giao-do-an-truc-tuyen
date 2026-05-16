const modelQuestion = require('../models/question.model');
const modelUser = require('../models/users.model');

const { AuthFailureError, BadRequestError } = require('../core/error.response');
const { OK } = require('../core/success.response');

class questionController {
    async createQuestion(req, res) {
        const { id } = req.user;
        const { title, question } = req.body;
        const newQuestion = await modelQuestion.create({
            question,
            userId: id,
            title,
        });
        new OK({
            message: 'Tạo câu hỏi thành công',
            metadata: newQuestion,
        }).send(res);
    }

    async getAllQuestion(req, res) {
        const questions = await modelQuestion.findAll({});
        const data = await Promise.all(
            questions.map(async (question) => {
                const user = await modelUser.findOne({
                    where: { id: question.userId },
                    attributes: ['id', 'fullName', 'avatar', 'email'],
                });
                const admin = question.adminId
                    ? await modelUser.findOne({
                          where: { id: question.adminId },
                          attributes: ['id', 'fullName', 'avatar', 'email'],
                      })
                    : null;
                return {
                    ...question.toJSON(),
                    user: {
                        id: user.id,
                        fullName: user.fullName,
                        avatar: user.avatar,
                    },
                    admin: admin
                        ? {
                              id: admin.id,
                              fullName: admin.fullName,
                              avatar: admin.avatar,
                          }
                        : null,
                };
            }),
        );
        new OK({
            message: 'Lấy danh sách câu hỏi thành công',
            metadata: data,
        }).send(res);
    }

    async answerQuestion(req, res) {
        const { id } = req.user;
        const { questionId, answer } = req.body;

        if (!questionId || !answer) {
            throw new BadRequestError('Thiếu thông tin câu hỏi hoặc câu trả lời');
        }

        const question = await modelQuestion.findByPk(questionId);
        if (!question) {
            throw new BadRequestError('Câu hỏi không tồn tại');
        }

        if (question.adminId && question.adminId !== id) {
            throw new AuthFailureError('Bạn không có quyền trả lời câu hỏi này');
        }

        question.answer = answer;
        question.status = 'success';
        question.adminId = id;

        await question.save();

        new OK({
            message: 'Trả lời câu hỏi thành công',
            metadata: question,
        }).send(res);
    }
    async closeQuestion(req, res) {
        const { id } = req.user;
        const { questionId } = req.body;

        if (!questionId) {
            throw new BadRequestError('Thiếu thông tin câu hỏi');
        }

        const question = await modelQuestion.findByPk(questionId);
        if (!question) {
            throw new BadRequestError('Câu hỏi không tồn tại');
        }

        if (question.adminId && question.adminId !== id) {
            throw new AuthFailureError('Bạn không có quyền đóng câu hỏi này');
        }

        question.status = 'closed';
        question.adminId = id;

        await question.save();

        new OK({
            message: 'Đóng câu hỏi thành công',
            metadata: question,
        }).send(res);
    }
}

module.exports = new questionController();
