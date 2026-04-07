import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!navigator.onLine) {
      console.warn('Offline: richiesta non effettuata', err.config?.url);
    }
    return Promise.reject(err);
  }
);
