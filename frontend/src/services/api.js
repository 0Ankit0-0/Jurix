import axios from "axios";
import { toast } from "react-hot-toast";
import { handleApiError, apiConfig, UPLOAD_TIMEOUT, SIMULATION_TIMEOUT, retryRequest } from "@/utils/apiUtils";

const api = axios.create({
  ...apiConfig,
  withCredentials: true
});

// Request interceptor - runs before every request
api.interceptors.request.use(
  (config) => {
    // ✅ FIX: Use consistent auth_token key
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - runs after every response
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || "An error occurred";

    if (error.response?.status === 401) {
      toast.error("Session expired. Please log in again.");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      toast.error("You don't have permission to perform this action.");
    } else if (error.response?.status === 404) {
      toast.error("Resource not found.");
    } else if (error.response?.status >= 500) {
      toast.error("Server error. Please try again later.");
    } else {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// ===========================
// API Service Functions
// ===========================

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  signup: (userData) => api.post("/auth/signup", userData),
  verify: () => api.get("/auth/verify"),
  logout: () => api.post("/auth/logout"),
};

// Case APIs
export const caseAPI = {
  getAll: (params) => api.get("/cases", { params }),
  getById: (caseId) => api.get(`/cases/${caseId}`),
  create: (caseData) => api.post("/cases/create", caseData),
  update: (caseId, caseData) => api.put(`/cases/${caseId}`, caseData),
  delete: (caseId) => api.delete(`/cases/${caseId}`),
  updateStatus: (caseId, status) => api.put(`/cases/${caseId}/update-status`, { status }),
  publish: (caseId, userId) => api.post(`/cases/${caseId}/publish`, { user_id: userId }),
  unpublish: (caseId, userId) => api.post(`/cases/${caseId}/unpublish`, { user_id: userId }),
  getMyCases: (userId) => api.get(`/cases/user/${userId}`),
  getPublicCases: (limit = 20) => api.get("/cases/public", { params: { limit } }),
  getFeaturedCases: () => api.get("/cases/public/featured"),
  simulatePublicCase: (caseId, userId) => api.post(`/cases/public/${caseId}/simulate`, { user_id: userId }),
  downloadPdf: (caseId) => api.get(`/cases/${caseId}/download-pdf`, { 
    responseType: 'blob',
    headers: {
      'Accept': 'application/pdf'
    }
  }),
  
  // ✅ FIX: Corrected evidence upload endpoint
  uploadEvidence: (caseId, formData) => api.post(`/cases/${caseId}/upload-evidence`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: UPLOAD_TIMEOUT,
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      console.log(`Upload Progress: ${percentCompleted}%`);
    },
    maxContentLength: 10485760, // 10MB max
    maxBodyLength: 10485760,
  }),
};

// Evidence APIs (keeping legacy endpoint names for backward compatibility)
export const evidenceAPI = {
  upload: (caseId, formData) => caseAPI.uploadEvidence(caseId, formData),
  list: (caseId) => api.get(`/evidence/${caseId}`),
  delete: (evidenceId) => api.delete(`/evidence/${evidenceId}`),
};

// Simulation APIs with retry logic
export const simulationAPI = {
  start: async (caseId) => {
    try {
      const statusCheck = await api.get(`/simulation/status/${caseId}`);
      
      if (!statusCheck.data.ready_for_simulation) {
        try {
          await api.put(`/cases/${caseId}/update-status`, {
            status: 'ready_for_simulation'
          });
        } catch (err) {
          console.warn("Warning: Failed to update case status", err);
        }
      }
      
      return retryRequest(
        () => api.post(`/simulation/start/${caseId}`, {}, {
          timeout: SIMULATION_TIMEOUT
        }),
        2,
        2000
      );
    } catch (error) {
      const errorMsg = handleApiError(error);
      throw new Error(errorMsg);
    }
  },
  getResults: (caseId) => api.get(`/simulation/results/${caseId}`),
  getStatus: (caseId) => api.get(`/simulation/status/${caseId}`),
  getReport: (caseId) => api.get(`/simulation/report/${caseId}`, { responseType: 'blob' }),
  healthCheck: () => retryRequest(() => api.get("/simulation/health"), 3, 1000),
};

// Report APIs
export const reportAPI = {
  generate: (caseId) => api.post(`/reports/generate/${caseId}`),
  export: (caseId) => api.get(`/reports/export/${caseId}`),
  get: (caseId) => api.get(`/reports/get/${caseId}`),
  summary: (caseId) => api.get(`/reports/summary/${caseId}`),
};

// Discussion APIs
export const discussionAPI = {
  getDiscussions: (caseId) => api.get(`/discussions/${caseId}`),
  addDiscussion: (caseId, data) => api.post(`/discussions/${caseId}/add`, data),
  likeDiscussion: (discussionId) => api.post(`/discussions/${discussionId}/like`),
  deleteDiscussion: (discussionId, userId) => api.delete(`/discussions/${discussionId}/delete`, { data: { user_id: userId } }),
};

// Chatbot APIs
export const chatbotAPI = {
  query: (queryData) => api.post("/chatbot/query", queryData),
  health: () => api.get("/chatbot/health"),
  getModes: () => api.get("/chatbot/modes"),
  getSuggestions: () => api.get("/chatbot/suggestions"),
};

export default api;