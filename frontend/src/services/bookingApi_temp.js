/**
 * Booking Service API
 */
export const bookingApi = {
    // Work Requests (Kerkesa Punes)
    createWorkRequest: (data) => fetchApi('/api/kerkesa-punes', {
        method: 'POST',
        body: data,
    }),
    getAllWorkRequests: () => fetchApi('/api/kerkesa-punes'),
    getWorkRequest: (id) => fetchApi(`/api/kerkesa-punes/${id}`),
    updateWorkRequest: (id, data) => fetchApi(`/api/kerkesa-punes/${id}`, {
        method: 'PUT',
        body: data,
    }),
    deleteWorkRequest: (id) => fetchApi(`/api/kerkesa-punes/${id}`, {
        method: 'DELETE',
    }),

    // Availability (Liria Ores)
    createAvailability: (data) => fetchApi('/api/liria-ores', {
        method: 'POST',
        body: data,
    }),
    getAvailability: (profesionistiId) => fetchApi(`/api/liria-ores/${profesionistiId}`),
    deleteAvailability: (id) => fetchApi(`/api/liria-ores/${id}`, {
        method: 'DELETE',
    }),
};
