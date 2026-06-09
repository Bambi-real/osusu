import api from './axios';

export const adminApi = {
  getStats: () =>
    api.get('/admin/stats'),

  getUsers: (params = {}) =>
    api.get('/admin/users', { params }),

  getUser: (id) =>
    api.get(`/admin/users/${id}`),

  getGroups: (params = {}) =>
    api.get('/admin/groups', { params }),

  getGroup: (id) =>
    api.get(`/admin/groups/${id}`),
};
