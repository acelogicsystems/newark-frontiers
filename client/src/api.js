import axios from 'axios';

const API = axios.create({
    baseURL: 'https://giddily-impart-smugly.ngrok-free.dev/api',
});

// Consolidated Interceptor: Handles Auth and Ngrok Bypassing
API.interceptors.request.use((req) => {
    // 1. Attach JWT Token
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    
    // 2. Bypass the Ngrok "Visit Site" warning page for API calls
    req.headers['ngrok-skip-browser-warning'] = 'true';
    
    return req;
}, (error) => {
    return Promise.reject(error);
});

/**
 * Repayment API Call
 * Hits: /api/loans/:id/repay
 */
export const repayLoan = async (loanId, amount) => {
    const response = await API.post(`/loans/${loanId}/repay`, { amount });
    return response.data;
};

export default API;