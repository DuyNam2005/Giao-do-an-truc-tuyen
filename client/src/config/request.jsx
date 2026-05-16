import axios from 'axios';

import { apiClient } from './axiosClient';

const request = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

const apiUser = '/api/users';

export const requestRegister = async (data) => {
    const res = await request.post(`${apiUser}/register`, data);
    return res;
};

export const requestLogin = async (data) => {
    const res = await request.post(`${apiUser}/login`, data);
    return res;
};

export const requestLoginGoogle = async (data) => {
    const res = await request.post(`${apiUser}/login-google`, data);
    return res;
};

export const requestAuth = async () => {
    const res = await apiClient.get(`${apiUser}/auth`);
    return res.data;
};

export const requestLogout = async () => {
    const res = await apiClient.get(`${apiUser}/logout`);
    return res.data;
};

export const requestRefreshToken = async () => {
    const res = await request.get(`${apiUser}/refresh-token`);
    return res.data;
};

export const requestGetUsers = async () => {
    const res = await apiClient.get(`${apiUser}/get-users`);
    return res.data;
};

export const requestUpdateUser = async (data) => {
    const res = await apiClient.post(`${apiUser}/update-user`, data);
    return res.data;
};

export const requestDeleteUser = async (data) => {
    const res = await apiClient.post(`${apiUser}/delete-user`, data);
    return res.data;
};

export const requestUpdatePassword = async (data) => {
    const res = await apiClient.post(`${apiUser}/update-password`, data);
    return res.data;
};

export const requestGetDashboard = async () => {
    const res = await apiClient.get(`${apiUser}/get-dashboard`);
    return res.data;
};

export const requestForgotPassword = async (data) => {
    const res = await apiClient.post(`${apiUser}/forgot-password`, data);
    return res.data;
};

export const requestResetPassword = async (data) => {
    const res = await apiClient.post(`${apiUser}/reset-password`, data);
    return res.data;
};

/// category
const apiCategory = '/api/category';
export const requestGetCategories = async () => {
    const res = await request.get(`${apiCategory}/get-categories`);
    return res.data;
};

export const requestGetProductByCategory = async (categoryId, page, limit) => {
    const res = await request.get(
        `${apiProduct}/products-by-category?categoryId=${categoryId}&page=${page}&limit=${limit}`,
    );
    return res.data;
};

export const requestCreateCategory = async (data) => {
    const res = await apiClient.post(`${apiCategory}/create`, data);
    return res.data;
};

export const requestUpdateCategory = async (data) => {
    const res = await apiClient.post(`${apiCategory}/update`, data);
    return res.data;
};

export const requestDeleteCategory = async (data) => {
    const res = await apiClient.post(`${apiCategory}/delete`, data);
    return res.data;
};

/// product
const apiProduct = '/api/product';

export const requestSearchProduct = async (query) => {
    const res = await request.get(`${apiProduct}/search-product?query=${query}`);
    return res.data;
};

export const requestGetProducts = async (page, limit) => {
    const res = await request.get(`${apiProduct}/get-products?page=${page}&limit=${limit}`);
    return res.data;
};

export const requestGetProductById = async (id) => {
    const res = await request.get(`${apiProduct}/get-product-by-id?id=${id}`);
    return res.data;
};

export const requestUploadImage = async (data) => {
    const res = await apiClient.post(`${apiProduct}/upload-image`, data);
    return res.data;
};

export const requestCreateProduct = async (data) => {
    const res = await apiClient.post(`${apiProduct}/create`, data);
    return res.data;
};

export const requestUpdateProduct = async (data) => {
    const res = await apiClient.post(`${apiProduct}/update-product`, data);
    return res.data;
};

export const requestDeleteProduct = async (id) => {
    const res = await apiClient.post(`${apiProduct}/delete-product?id=${id}`);
    return res.data;
};

export const requestGetAllProductAdmin = async () => {
    const res = await apiClient.get(`${apiProduct}/get-all-product-admin`);
    return res.data;
};

/// cart
const apiCart = '/api/cart';
export const requestCreateCart = async (data) => {
    const res = await apiClient.post(`${apiCart}/create`, data);
    return res.data;
};

export const requestGetCart = async () => {
    const res = await apiClient.get(`${apiCart}/get-cart`);
    return res.data;
};

export const requestUpdateCartQuantity = async (data) => {
    const res = await apiClient.put(`${apiCart}/update-quantity`, data);
    return res.data;
};

export const requestRemoveCartItem = async (productId) => {
    const res = await apiClient.delete(`${apiCart}/remove/${productId}`);
    return res.data;
};

export const requestUpdateInfoCart = async (data) => {
    const res = await apiClient.post(`${apiCart}/update-info`, data);
    return res.data;
};

/// payments
const apiPayments = '/api/payments';
export const requestCreatePayment = async (data) => {
    const res = await apiClient.post(`${apiPayments}/create`, data);
    return res.data;
};

export const requestGetPaymentById = async (id) => {
    const res = await apiClient.get(`${apiPayments}/payment?id=${id}`);
    return res.data;
};

export const requestGetPaymentsByUserId = async () => {
    const res = await apiClient.get(`${apiPayments}/payments`);
    return res.data;
};

export const requestCancelPayment = async (idPayment) => {
    const res = await apiClient.post(`${apiPayments}/cancel`, { idPayment });
    return res.data;
};

export const requestGetPaymentsAdmin = async () => {
    const res = await apiClient.get(`${apiPayments}/payments-admin`);
    return res.data;
};

export const requestUpdateStatus = async (data) => {
    const res = await apiClient.post(`${apiPayments}/update-status`, data);
    return res.data;
};

export const requestAddDriver = async (data) => {
    const res = await apiClient.post(`${apiPayments}/add-driver`, data);
    return res.data;
};

/// coupon

const apiCoupon = '/api/coupon';
export const requestCreateCoupon = async (data) => {
    const res = await apiClient.post(`${apiCoupon}/create`, data);
    return res.data;
};

export const requestGetAllCoupon = async () => {
    const res = await apiClient.get(`${apiCoupon}/get-all-coupon`);
    return res.data;
};

export const requestUpdateCoupon = async (data) => {
    const res = await apiClient.post(`${apiCoupon}/update`, data);
    return res.data;
};

export const requestDeleteCoupon = async (id) => {
    const res = await apiClient.post(`${apiCoupon}/delete`, { id });
    return res.data;
};

export const requestAddCouponToCart = async (idCoupon) => {
    const res = await apiClient.post(`${apiCoupon}/add-coupon-to-cart`, { idCoupon });
    return res.data;
};

//// preview
const apiPreview = '/api/preview';
export const requestCreatePreview = async (data) => {
    const res = await apiClient.post(`${apiPreview}/create`, data);
    return res.data;
};

export const requestGetPreviewByUser = async () => {
    const res = await apiClient.get(`${apiPreview}/get-by-user`);
    return res.data;
};

export const requestUpdatePreview = async (data) => {
    const res = await apiClient.post(`${apiPreview}/update`, data);
    return res.data;
};

export const requestDeletePreview = async (data) => {
    const res = await apiClient.post(`${apiPreview}/delete`, data);
    return res.data;
};

//// favourite product
const apiFavouriteProduct = '/api/favourite-product';
export const requestAddFavouriteProduct = async (data) => {
    const res = await apiClient.post(`${apiFavouriteProduct}/add-favourite-product`, data);
    return res.data;
};

export const requestDeleteFavouriteProduct = async (data) => {
    const res = await apiClient.post(`${apiFavouriteProduct}/delete-favourite-product`, data);
    return res.data;
};

export const requestGetFavouriteProducts = async () => {
    const res = await apiClient.get(`${apiFavouriteProduct}/get-favourite-products`);
    return res.data;
};

/// requestion
const apiRequestion = '/api/question';
export const requestCreateRequestion = async (data) => {
    const res = await apiClient.post(`${apiRequestion}/create`, data);
    return res.data;
};

export const requestGetAllRequestion = async () => {
    const res = await apiClient.get(`${apiRequestion}/all`);
    return res.data;
};

export const requestAnswerRequestion = async (data) => {
    const res = await apiClient.post(`${apiRequestion}/answer`, data);
    return res.data;
};

export const requestCloseRequestion = async (data) => {
    const res = await apiClient.post(`${apiRequestion}/close`, data);
    return res.data;
};
