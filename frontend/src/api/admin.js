import axios from "axios";
import { url } from "./auth";

const API = axios.create({ baseURL: url });

function getAdminKey() {
  return localStorage.getItem("adminApiKey") || "";
}

export const fetchAdminStats = () => API.get(`/admin-api/stats/${encodeURIComponent(getAdminKey())}`);
export const fetchAllUsers = () => API.get(`/admin-api/users/${encodeURIComponent(getAdminKey())}`);
export const updateUser = (userId, data) => API.post(`/admin-api/updateUser/${encodeURIComponent(getAdminKey())}`, { userId, ...data });

export const getRechargeSettings = () => API.get(`/admin-api/recharge-settings/${encodeURIComponent(getAdminKey())}`);
export const updateRechargeSettings = (data) => API.post(`/admin-api/recharge-settings/${encodeURIComponent(getAdminKey())}`, data);

export const getCarouselAdmin = () => API.get(`/admin-api/carousel/${encodeURIComponent(getAdminKey())}`);
export const uploadCarouselImage = (formData) => API.post(`/admin-api/carousel/upload/${encodeURIComponent(getAdminKey())}`, formData);
export const addCarouselImageByUrl = (imageUrl) => API.post(`/admin-api/carousel/add-by-url/${encodeURIComponent(getAdminKey())}`, { imageUrl });
export const updateCarouselOrder = (orderedIds) => API.put(`/admin-api/carousel/order/${encodeURIComponent(getAdminKey())}`, { orderedIds });
export const deleteCarouselImage = (id) => API.delete(`/admin-api/carousel/${id}/${encodeURIComponent(getAdminKey())}`);
