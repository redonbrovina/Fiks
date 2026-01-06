const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Generic fetch wrapper with JSON handling
 */
async function fetchApi(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.error?.message || data.message || 'Something went wrong');
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}

/**
 * Authentication API
 */
export const authApi = {
    register: (userData) => fetchApi('/api/auth/register', {
        method: 'POST',
        body: userData,
    }),

    login: (credentials) => fetchApi('/api/auth/login', {
        method: 'POST',
        body: credentials,
    }),

    refresh: (refreshToken) => fetchApi('/api/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
    }),

    logout: (refreshToken) => fetchApi('/api/auth/logout', {
        method: 'POST',
        body: { refreshToken },
    }),
};

/**
 * Cities API
 */
export const qytetiApi = {
    getAll: () => fetchApi('/api/qytetet'),
};

/**
 * Token management utilities
 */
export const tokenStorage = {
    setTokens: (accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    },

    getAccessToken: () => localStorage.getItem('accessToken'),
    getRefreshToken: () => localStorage.getItem('refreshToken'),

    clearTokens: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    },
};
