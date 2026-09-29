import api from "./api.js";

export const authService = {
  login: (payload) => api.post("/auth/login", payload).then((r) => r.data.data),
  logout: () => api.post("/auth/logout").then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data.data),
};

export const lookupService = {
  bases: () => api.get("/bases").then((r) => r.data.data),
  equipmentTypes: () => api.get("/equipment-types").then((r) => r.data.data),
};

export const dashboardService = {
  summary: (params) => api.get("/dashboard/summary", { params }).then((r) => r.data.data),
};

export const purchasesService = {
  list: (params) => api.get("/purchases", { params }).then((r) => r.data.data),
  create: (payload) => api.post("/purchases", payload).then((r) => r.data.data),
};

export const transfersService = {
  list: (params) => api.get("/transfers", { params }).then((r) => r.data.data),
  get: (id) => api.get(`/transfers/${id}`).then((r) => r.data.data),
  create: (payload) => api.post("/transfers", payload).then((r) => r.data.data),
};

export const assignmentsService = {
  list: (params) => api.get("/assignments", { params }).then((r) => r.data.data),
  create: (payload) => api.post("/assignments", payload).then((r) => r.data.data),
};

export const expendituresService = {
  list: (params) => api.get("/expenditures", { params }).then((r) => r.data.data),
  create: (payload) => api.post("/expenditures", payload).then((r) => r.data.data),
};

export const auditService = {
  list: (params) => api.get("/audit-logs", { params }).then((r) => r.data.data),
};
