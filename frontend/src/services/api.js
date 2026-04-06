// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
});

// Interceptor to attach the JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// --- Existing Exports ---
export const getAnalysisResults = () => api.get('/analysis/');
export const getRiskTrend = () => api.get('/analysis/risk-trend/');
export const uploadFile = (formData) => api.post('/uploads/', formData);

// --- NEW: Tutorial Export ---
export const getTutorials = () => api.get('/tutorials/');

export default api;
