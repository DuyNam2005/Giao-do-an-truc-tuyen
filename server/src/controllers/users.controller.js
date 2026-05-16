const modelUser = require('../models/users.model');
const modelApiKey = require('../models/apiKey.model');
const modelProduct = require('../models/product.model');
const modelOtp = require('../models/otp.model');

const { AuthFailureError, BadRequestError } = require('../core/error.response');
const { OK } = require('../core/success.response');
const { createApiKey, createRefreshToken, createToken, verifyToken } = require('../services/tokenServices');

const cloudinary = require('../utils/configCloudDinary');
const sendMailForgotPassword = require('../utils/sendMailForgotPassword');

const bcrypt = require('bcrypt');
const CryptoJS = require('crypto-js');
const { jwtDecode } = require('jwt-decode');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');

require('dotenv').config();

class controllerUser {
    async registerUser(req, res) {
        const { fullName, phone, address, email, password } = req.body;
        if (!fullName || !phone || !address || !email || !password) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        const findUser = await modelUser.findOne({ where: { email } });

        if (findUser) {
            throw new BadRequestError('Email đã tồn tại');
        }

        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const passwordHash = bcrypt.hashSync(password, salt);
        const dataUser = await modelUser.create({
            fullName,
            phone,
            address,
            email,
            password: passwordHash,
            typeLogin: 'email',
        });

        await dataUser.save();
        await createApiKey(dataUser.id);
        const token = await createToken({
            id: dataUser.id,
            isAdmin: dataUser.isAdmin,
            address: dataUser.address,
            phone: dataUser.phone,
        });
        const refreshToken = await createRefreshToken({ id: dataUser.id });
        res.cookie('token', token, {
            httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
            secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
            sameSite: 'Strict', // Chống tấn công CSRF
            maxAge: 15 * 60 * 1000, // 15 phút
        });

        res.cookie('logged', 1, {
            httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
            secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
            sameSite: 'Strict', // Chống tấn công CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });

        // Đặt cookie HTTP-Only cho refreshToken (tùy chọn)
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });

        new OK({ message: 'Đăng nhập thành công', metadata: { token, refreshToken } }).send(res);
    }

    async loginUser(req, res) {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        const findUser = await modelUser.findOne({ where: { email } });
        if (!findUser) {
            throw new AuthFailureError('Tài khoản hoặc mật khẩu không chính xác');
        }
        const isPasswordValid = bcrypt.compareSync(password, findUser.password);
        if (!isPasswordValid) {
            throw new AuthFailureError('Tài khoản hoặc mật khẩu không chính xác');
        }
        await createApiKey(findUser.id);
        const token = await createToken({ id: findUser.id, isAdmin: findUser.isAdmin });
        const refreshToken = await createRefreshToken({ id: findUser.id });
        res.cookie('token', token, {
            httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
            secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
            sameSite: 'Strict', // Chống tấn công CSRF
            maxAge: 15 * 60 * 1000, // 15 phút
        });
        res.cookie('logged', 1, {
            httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
            secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
            sameSite: 'Strict', // Chống tấn công CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });
        new OK({ message: 'Đăng nhập thành công', metadata: { token, refreshToken } }).send(res);
    }

    async authUser(req, res) {
        const { id } = req.user;

        const findUser = await modelUser.findOne({ where: { id } });

        if (!findUser) {
            throw new AuthFailureError('Tài khoản không tồn tại');
        }

        const auth = CryptoJS.AES.encrypt(JSON.stringify(findUser), process.env.SECRET_CRYPTO).toString();

        new OK({ message: 'success', metadata: auth }).send(res);
    }

    async refreshToken(req, res) {
        const refreshToken = req.cookies.refreshToken;

        const decoded = await verifyToken(refreshToken);

        const user = await modelUser.findOne({ where: { id: decoded.id } });
        const token = await createToken({ id: user.id });
        res.cookie('token', token, {
            httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
            secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
            sameSite: 'Strict', // Chống tấn công CSRF
            maxAge: 15 * 60 * 1000, // 15 phút
        });

        res.cookie('logged', 1, {
            httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
            secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
            sameSite: 'Strict', // Chống tấn công CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });

        new OK({ message: 'Refresh token thành công', metadata: { token } }).send(res);
    }

    async logout(req, res) {
        const { id } = req.user;
        await modelApiKey.destroy({ where: { userId: id } });
        res.clearCookie('token');
        res.clearCookie('refreshToken');
        res.clearCookie('logged');

        new OK({ message: 'Đăng xuất thành công' }).send(res);
    }

    async updateInfoUser(req, res, next) {
        const { id } = req.user;
        const { fullName, address, phone, sex } = req.body;

        const user = await modelUser.findOne({ where: { id } });

        let image = '';
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            image = result.secure_url;
        } else {
            image = user.avatar;
        }

        if (!user) {
            throw new BadRequestError('Không tìm thấy tài khoản');
        }
        await user.update({ fullName, address, phone, sex, avatar: image });

        new OK({ message: 'Cập nhật thông tin tài khoản thành cong' }).send(res);
    }

    async loginGoogle(req, res) {
        const { credential } = req.body;
        const dataToken = jwtDecode(credential);
        const user = await modelUser.findOne({ where: { email: dataToken.email } });
        if (user) {
            await createApiKey(user.id);
            const token = await createToken({ id: user.id });
            const refreshToken = await createRefreshToken({ id: user.id });
            res.cookie('token', token, {
                httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // Chống tấn công CSRF
                maxAge: 15 * 60 * 1000, // 15 phút
            });
            res.cookie('logged', 1, {
                httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // ChONGL tấn công CSRF
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            new OK({ message: 'Đăng nhập thành công', metadata: { token, refreshToken } }).send(res);
        } else {
            const newUser = await modelUser.create({
                fullName: dataToken.name,
                email: dataToken.email,
                typeLogin: 'google',
            });
            await newUser.save();
            await createApiKey(newUser.id);
            const token = await createToken({ id: newUser.id });
            const refreshToken = await createRefreshToken({ id: newUser.id });
            res.cookie('token', token, {
                httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // ChONGL tấn công CSRF
                maxAge: 15 * 60 * 1000, // 15 phút
            });
            res.cookie('logged', 1, {
                httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // ChONGL tấn công CSRF
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            new OK({ message: 'Đăng nhập thành công', metadata: { token, refreshToken } }).send(res);
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                throw new BadRequestError('Vui lòng nhập email');
            }

            const user = await modelUser.findOne({ where: { email } });
            if (!user) {
                throw new AuthFailureError('Email không tồn tại');
            }

            const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
            const otp = await otpGenerator.generate(6, {
                digits: true,
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false,
                specialChars: false,
            });

            const saltRounds = 10;

            bcrypt.hash(otp, saltRounds, async function (err, hash) {
                if (err) {
                    console.error('Error hashing OTP:', err);
                } else {
                    await modelOtp.create({
                        email: user.email,
                        otp: hash,
                    });
                    await sendMailForgotPassword(email, otp);

                    return res
                        .setHeader('Set-Cookie', [
                            `tokenResetPassword=${token};  Secure; Max-Age=300; Path=/; SameSite=Strict`,
                        ])
                        .status(200)
                        .json({ message: 'Gửi thành công !!!' });
                }
            });
        } catch (error) {
            console.error('Error forgot password:', error);
            return res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    }

    async resetPassword(req, res) {
        try {
            const token = req.cookies.tokenResetPassword;
            const { otp, newPassword } = req.body;

            if (!token) {
                throw new BadRequestError('Vui lòng gửi yêu cầu quên mật khẩu');
            }

            const decode = jwt.verify(token, process.env.JWT_SECRET);
            if (!decode) {
                throw new AuthFailureError('Sai mã OTP hoặc đã hết hạn, vui lòng lấy OTP mới');
            }

            const findOTP = await modelOtp.findOne({
                where: { email: decode.email },
                order: [['createdAt', 'DESC']],
            });
            if (!findOTP) {
                throw new AuthFailureError('Sai mã OTP hoặc đã hết hạn, vui lòng lấy OTP mới');
            }

            // So sánh OTP
            const isMatch = await bcrypt.compare(otp, findOTP.otp);
            if (!isMatch) {
                throw new AuthFailureError('Sai mã OTP hoặc đã hết hạn, vui lòng lấy OTP mới');
            }

            // Hash mật khẩu mới
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            // Tìm người dùng
            const findUser = await modelUser.findOne({ where: { email: decode.email } });
            if (!findUser) {
                throw new AuthFailureError('Người dùng không tồn tại');
            }

            // Cập nhật mật khẩu mới
            findUser.password = hashedPassword;
            await findUser.save();

            // Xóa OTP sau khi đặt lại mật khẩu thành công
            await modelOtp.destroy({ where: { email: decode.email } });
            res.clearCookie('tokenResetPassword');
            return res.status(200).json({ message: 'Đặt lại mật khẩu thành công' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng liên hệ ADMIN !!' });
        }
    }

    async getUsers(req, res) {
        const users = await modelUser.findAll();
        new OK({ message: 'Lấy danh sách người dùng thành công', metadata: users }).send(res);
    }

    async updateUser(req, res) {
        const { userId, fullName, phone, email, role, address } = req.body;
        const user = await modelUser.findOne({ where: { id: userId } });
        if (!user) {
            throw new BadRequestError('Người dùng không tồn tại');
        }
        user.fullName = fullName;
        user.phone = phone;
        user.email = email;
        user.role = role;
        user.address = address;
        await user.save();
        new OK({ message: 'Cập nhật người dùng thành công' }).send(res);
    }

    async deleteUser(req, res) {
        const { userId } = req.body;
        const user = await modelUser.findOne({ where: { id: userId } });
        if (!user) {
            throw new BadRequestError('Người dùng không tồn tại');
        }
        await user.destroy();
        new OK({ message: 'Xóa người dùng thành công' }).send(res);
    }

    async updatePassword(req, res) {
        const { userId, password } = req.body;
        const user = await modelUser.findOne({ where: { id: userId } });
        if (!user) {
            throw new BadRequestError('Người dùng không tồn tại');
        }
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const passwordHash = bcrypt.hashSync(password, salt);
        user.password = passwordHash;
        await user.save();
        new OK({ message: 'Cập nhật mật khẩu thành công' }).send(res);
    }

    async getDashboard(req, res, next) {
        try {
            const { timeRange = 'all' } = req.query;

            // Get date range based on the timeRange
            const getDateRange = () => {
                const now = new Date();
                if (timeRange === 'today') {
                    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
                    return { startDate: startOfDay };
                }
                if (timeRange === 'week') {
                    const startOfWeek = new Date(now);
                    startOfWeek.setDate(now.getDate() - 7);
                    return { startDate: startOfWeek };
                }
                if (timeRange === 'month') {
                    const startOfMonth = new Date(now);
                    startOfMonth.setDate(now.getDate() - 30);
                    return { startDate: startOfMonth };
                }
                return {}; // All time, no date filtering
            };

            const dateRange = getDateRange();
            const dateFilter = dateRange.startDate
                ? {
                      where: {
                          createdAt: {
                              $gte: dateRange.startDate,
                          },
                      },
                  }
                : {};

            // Load all required models at once to avoid repeated requires
            const categoryModel = require('../models/category.model');
            const questionModel = require('../models/question.model');
            const paymentsModel = require('../models/payments.model');
            const previewModel = require('../models/previewProduct.model');
            const favouriteModel = require('../models/favouriteProduct.model');

            // Run multiple queries in parallel for better performance
            const [usersList, productsList, categories, questionsList, paymentsList, reviewsList, favouritesList] =
                await Promise.all([
                    modelUser.findAll(),
                    modelProduct.findAll(),
                    categoryModel.findAll(),
                    questionModel.findAll(),
                    paymentsModel.findAll(),
                    previewModel.findAll(),
                    favouriteModel.findAll(),
                ]);

            // Get total users and count by role with better formatting
            const usersByRole = usersList.reduce((acc, user) => {
                const role = user.role;
                if (!acc[role]) acc[role] = 0;
                acc[role]++;
                return acc;
            }, {});

            // Prepare category mapping for faster lookups
            const categoryMap = {};
            categories.forEach((category) => {
                categoryMap[category.id] = category.categoryName;
            });

            // Get products by category with optimized lookup
            const productsByCategoryMap = {};
            productsList.forEach((product) => {
                const categoryName = categoryMap[product.categoryId] || 'Uncategorized';
                if (!productsByCategoryMap[categoryName]) productsByCategoryMap[categoryName] = 0;
                productsByCategoryMap[categoryName]++;
            });

            const productsByCategory = Object.entries(productsByCategoryMap)
                .map(([category, count]) => ({ category, count }))
                .filter((item) => item.count > 0)
                .sort((a, b) => b.count - a.count);

            // Get products by status with enhanced colors
            const productsByStatus = productsList.reduce((acc, product) => {
                const status = product.productStatus;
                if (!acc[status]) acc[status] = 0;
                acc[status]++;
                return acc;
            }, {});

            // Get questions data with improved status formatting
            const questionsByStatus = questionsList.reduce((acc, question) => {
                const status = question.status;
                if (!acc[status]) acc[status] = 0;
                acc[status]++;
                return acc;
            }, {});

            // Get payments data with optimized processing
            let totalRevenue = 0;
            const statusCounts = {};

            // Create a map of user IDs to names for faster lookups
            const userMap = {};
            usersList.forEach((user) => {
                userMap[user.id] = user.fullName;
            });

            // Process payments in a single pass
            paymentsList.forEach((payment) => {
                const status = payment.status;

                // Update total revenue
                totalRevenue += payment.totalPrice;

                // Update status counts
                if (!statusCounts[status]) {
                    statusCounts[status] = {
                        count: 0,
                        revenue: 0,
                    };
                }
                statusCounts[status].count++;
                statusCounts[status].revenue += payment.totalPrice;
            });

            // Format payments by status
            const paymentsByStatus = Object.entries(statusCounts).map(([status, data]) => ({
                status,
                count: data.count,
                revenue: data.revenue,
            }));

            // Get recent payments with optimized user lookup
            const recentPayments = paymentsList
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 10)
                .map((payment) => ({
                    id: payment.idPayment,
                    user: userMap[payment.userId] || 'Unknown',
                    amount: payment.totalPrice,
                    status: payment.status,
                    date: payment.createdAt.toISOString().split('T')[0],
                }));

            // Get review data with enhanced rating calculations
            const ratingCounts = {};
            let totalRatingSum = 0;

            reviewsList.forEach((review) => {
                const rating = review.rating;
                if (!ratingCounts[rating]) ratingCounts[rating] = 0;
                ratingCounts[rating]++;
                totalRatingSum += rating;
            });

            // Create ratings array with all scores 1-5
            const ratingsByScore = [];
            for (let i = 1; i <= 5; i++) {
                ratingsByScore.push({
                    rating: i,
                    count: ratingCounts[i] || 0,
                    percentage:
                        reviewsList.length > 0 ? Math.round(((ratingCounts[i] || 0) / reviewsList.length) * 100) : 0,
                });
            }

            const averageRating = reviewsList.length > 0 ? (totalRatingSum / reviewsList.length).toFixed(1) : 0;

            // Get favorite products data with optimized processing
            const favoritesByProduct = {};
            favouritesList.forEach((fav) => {
                if (!favoritesByProduct[fav.productId]) favoritesByProduct[fav.productId] = 0;
                favoritesByProduct[fav.productId]++;
            });

            // Create a map of product IDs to names for faster lookups
            const productMap = {};
            productsList.forEach((product) => {
                productMap[product.id] = {
                    name: product.productName,
                    price: product.productPrice,
                    image: product.productImage,
                };
            });

            // Map favorite products with product details
            const topFavorites = Object.entries(favoritesByProduct)
                .map(([productId, count]) => ({
                    id: productId,
                    name: productMap[productId]?.name || 'Unknown Product',
                    count,
                    image: productMap[productId]?.image || '',
                    price: productMap[productId]?.price || 0,
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);

            // Format data for frontend charts with enhanced colors and details
            const data = {
                users: {
                    total: usersList.length,
                    byRole: Object.entries(usersByRole).map(([role, count]) => ({
                        role,
                        count,
                        color: role === 'admin' ? '#fa8c16' : role === 'driver' ? '#52c41a' : '#1890ff',
                        percentage: Math.round((count / usersList.length) * 100),
                    })),
                },
                products: {
                    total: productsList.length,
                    byCategory: productsByCategory,
                    byStatus: Object.entries(productsByStatus).map(([status, count]) => ({
                        status,
                        count,
                        color: status === 'active' ? '#52c41a' : '#f5222d',
                        percentage: Math.round((count / productsList.length) * 100),
                    })),
                },
                questions: {
                    total: questionsList.length,
                    byStatus: Object.entries(questionsByStatus).map(([status, count]) => ({
                        status,
                        count,
                        color: status === 'pending' ? '#fa8c16' : status === 'answered' ? '#1890ff' : '#d9d9d9',
                        percentage: questionsList.length > 0 ? Math.round((count / questionsList.length) * 100) : 0,
                    })),
                },
                payments: {
                    total: paymentsList.length,
                    totalRevenue,
                    byStatus: paymentsByStatus.map((item) => ({
                        ...item,
                        percentage: paymentsList.length > 0 ? Math.round((item.count / paymentsList.length) * 100) : 0,
                        revenuePercentage: totalRevenue > 0 ? Math.round((item.revenue / totalRevenue) * 100) : 0,
                    })),
                    recentPayments,
                },
                reviews: {
                    total: reviewsList.length,
                    average: parseFloat(averageRating),
                    byRating: ratingsByScore,
                },
                favorites: {
                    topProducts: topFavorites,
                },
                // Add additional metrics for advanced dashboard features
                metrics: {
                    averageOrderValue: paymentsList.length > 0 ? Math.round(totalRevenue / paymentsList.length) : 0,
                    completionRate:
                        paymentsList.length > 0
                            ? Math.round(((statusCounts.success?.count || 0) / paymentsList.length) * 100)
                            : 0,
                    topCategories: productsByCategory.slice(0, 3).map((c) => c.category),
                },
            };

            new OK({ message: 'Lấy dữ liệu bảng điều khiển thành công', metadata: data }).send(res);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            next(error);
        }
    }
}

module.exports = new controllerUser();
