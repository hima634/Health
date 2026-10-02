import { request } from './client';

export const authService = {
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  signup: (userData) =>
    request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  getProfile: () => request('/auth/me')
};

export const centresService = {
  getAll: () => request('/centres'),
  getById: (id) => request(`/centres/${id}`)
};

export const testsService = {
  getAll: (centreId) => request(`/tests${centreId ? `?centreId=${centreId}` : ''}`),
  getById: (id) => request(`/tests/${id}`)
};

export const bookingsService = {
  create: (bookingData) =>
    request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    }),

  getUserBookings: () => request('/bookings'),

  getById: (id) => request(`/bookings/${id}`),

  cancel: (id) =>
    request(`/bookings/${id}/cancel`, {
      method: 'PATCH'
    })
};

export const paymentsService = {
  // Mock gateway payment simulation
  simulate: (simulationData) =>
    request('/payments/simulate', {
      method: 'POST',
      body: JSON.stringify(simulationData)
    }),

  // Direct webhook trigger (for testing webhook idempotency)
  triggerWebhook: (webhookPayload) =>
    request('/payments/webhook', {
      method: 'POST',
      body: JSON.stringify(webhookPayload)
    }),

  getPaymentForBooking: (bookingId) => request(`/payments/${bookingId}`)
};
