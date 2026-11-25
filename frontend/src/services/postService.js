import api from './api'

export const postService = {
  publicList: (params) => api.get('/public/posts', { params }),
  publicDetail: (slug) => api.get(`/public/posts/${slug}`),
  myPosts: (params) => api.get('/my-posts', { params }),
  myPost: (id) => api.get(`/posts/${id}`),
  create: (data) => api.post('/posts', data),
  update: (id, data) => api.post(`/posts/${id}`, data),
  remove: (id) => api.delete(`/posts/${id}`),
  adminDashboard: () => api.get('/admin/dashboard'),
  adminPosts: (params) => api.get('/admin/posts', { params }),
  enable: (id) => api.patch(`/admin/posts/${id}/enable`),
  disable: (id) => api.patch(`/admin/posts/${id}/disable`),
}
