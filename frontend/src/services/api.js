const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

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

    isAuthenticated: () => !!localStorage.getItem('accessToken'),
};

/**
 * Flag to prevent multiple simultaneous refresh attempts
 */
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(callback) {
    refreshSubscribers.push(callback);
}

function onTokenRefreshed(newAccessToken) {
    refreshSubscribers.forEach(callback => callback(newAccessToken));
    refreshSubscribers = [];
}

/**
 * Attempt to refresh the access token using the stored refresh token
 */
async function refreshAccessToken() {
    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
        // Refresh token is invalid or expired - clear everything
        tokenStorage.clearTokens();
        throw new Error('Session expired');
    }

    const data = await response.json();
    tokenStorage.setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
}

/**
 * Generic fetch wrapper with JSON handling and automatic token refresh
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

    // Add authorization header if we have a token (except for auth endpoints)
    const accessToken = tokenStorage.getAccessToken();
    if (accessToken && !endpoint.startsWith('/api/auth/')) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }

    let response = await fetch(url, config);

    // If we get a 401 and we have a refresh token, try to refresh
    if (response.status === 401 && tokenStorage.getRefreshToken() && !endpoint.startsWith('/api/auth/')) {
        if (!isRefreshing) {
            isRefreshing = true;
            try {
                const newAccessToken = await refreshAccessToken();
                isRefreshing = false;
                onTokenRefreshed(newAccessToken);

                // Retry the original request with the new token
                config.headers.Authorization = `Bearer ${newAccessToken}`;
                response = await fetch(url, config);
            } catch (error) {
                isRefreshing = false;
                // Redirect to login if refresh fails
                window.location.href = '/login';
                throw error;
            }
        } else {
            // Wait for the ongoing refresh to complete
            return new Promise((resolve, reject) => {
                subscribeTokenRefresh(async (newAccessToken) => {
                    config.headers.Authorization = `Bearer ${newAccessToken}`;
                    try {
                        const retryResponse = await fetch(url, config);
                        const retryData = await retryResponse.json();
                        if (!retryResponse.ok) {
                            const error = new Error(retryData.error?.message || retryData.message || 'Something went wrong');
                            error.status = retryResponse.status;
                            error.data = retryData;
                            reject(error);
                        }
                        resolve(retryData);
                    } catch (err) {
                        reject(err);
                    }
                });
            });
        }
    }

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

    logout: async () => {
        const refreshToken = tokenStorage.getRefreshToken();
        if (refreshToken) {
            try {
                await fetchApi('/api/auth/logout', {
                    method: 'POST',
                    body: { refreshToken },
                });
            } catch (error) {
                // Logout even if API call fails
                console.error('Logout API error:', error);
            }
        }
        tokenStorage.clearTokens();
    },
};

/**
 * Cities API
 */
export const qytetiApi = {
    getAll: () => fetchApi('/api/qytetet'),
};

/**
 * Catalog API - Profile Management
 */
export const catalogApi = {
    // Profile methods
    getProfile: (profesionistiId) => fetchApi(`/api/v1/catalog/profile/${profesionistiId}`),
    createProfile: (profileData) => fetchApi('/api/v1/catalog/profile', {
        method: 'POST',
        body: profileData,
    }),
    updateProfile: (profesionistiId, profileData) => fetchApi(`/api/v1/catalog/profile/${profesionistiId}`, {
        method: 'PUT',
        body: profileData,
    }),
    deleteProfile: (profesionistiId) => fetchApi(`/api/v1/catalog/profile/${profesionistiId}`, {
        method: 'DELETE',
    }),
    uploadProfileImage: (profesionistiId, imageFile) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        return fetchApi(`/api/v1/catalog/profile/${profesionistiId}/upload-image`, {
            method: 'POST',
            headers: {}, // Let browser set Content-Type for FormData
            body: formData,
        });
    },

    // Services methods
    getProfessionalServices: (profesionistiId) => fetchApi(`/api/v1/catalog/professional/${profesionistiId}/services`),
    getService: (serviceId) => fetchApi(`/api/v1/catalog/services/${serviceId}`),
    createService: (serviceData) => fetchApi('/api/v1/catalog/services', {
        method: 'POST',
        body: serviceData,
    }),
    updateService: (serviceId, serviceData) => fetchApi(`/api/v1/catalog/services/${serviceId}`, {
        method: 'PUT',
        body: serviceData,
    }),
    deleteService: (serviceId) => fetchApi(`/api/v1/catalog/services/${serviceId}`, {
        method: 'DELETE',
    }),
    getCategories: () => fetchApi('/api/v1/catalog/categories'),
};
