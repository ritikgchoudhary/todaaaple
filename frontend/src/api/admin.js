import axios from "axios";
import { url } from "./auth";

const API = axios.create({ baseURL: url });

const getAdminApi = () => localStorage.getItem("MASTER_ADMIN_API");

export function fetchAdminStats() {
    const adminApi = getAdminApi();
    return API.get(`/admin/stats/${adminApi}`);
}

export function fetchAllUsers() {
    const adminApi = getAdminApi();
    return API.get(`/admin/users/${adminApi}`);
}

export function updateUser(payload) {
    const adminApi = getAdminApi();
    return API.post(`/admin/updateUser/${adminApi}`, payload);
}

export function fetchAllWithdrawals() {
    const adminApi = getAdminApi();
    return API.get(`/getAllWithdrawal/${adminApi}`);
}

export function processWithdrawal(id, status, amount, userId, _id) {
    const adminApi = getAdminApi();
    return API.get(`/processWithdrawal/${id}/${status}/${amount}/${userId}/${adminApi}/${_id}`);
}

export function getRechargeSettings() {
    const adminApi = getAdminApi();
    return API.get(`/admin/recharge-settings/${adminApi || "admin"}`);
}

export function updateRechargeSettings(payload) {
    const adminApi = getAdminApi();
    return API.post(`/admin/recharge-settings/${adminApi || "admin"}`, payload);
}

export function getCarousel() {
    return API.get("/carousel");
}

export function getCarouselAdmin() {
    const adminApi = getAdminApi();
    return API.get(`/admin/carousel/${adminApi || "admin"}`);
}

export function uploadCarouselImage(file) {
    const adminApi = getAdminApi();
    const formData = new FormData();
    formData.append("image", file);
    return API.post(`/admin/carousel/upload/${adminApi || "admin"}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
}

/** Add carousel image by URL (CDN or any image link) - no upload, no 404 */
export function addCarouselImageByUrl(imageUrl) {
    const adminApi = getAdminApi();
    return API.post(`/admin/carousel/add-url/${adminApi || "admin"}`, { url: imageUrl });
}

export function updateCarouselOrder(images) {
    const adminApi = getAdminApi();
    return API.post(`/admin/carousel/order/${adminApi || "admin"}`, { images });
}

export function deleteCarouselImage(urlToDelete) {
    const adminApi = getAdminApi();
    return API.post(`/admin/carousel/delete/${adminApi || "admin"}`, { url: urlToDelete });
}

export function getSiteSettings() {
    return API.get("/site-settings");
}

export function getSiteSettingsAdmin() {
    const adminApi = getAdminApi();
    return API.get(`/admin/site-settings/${adminApi || "admin"}`);
}

export function uploadSiteLogo(file) {
    const adminApi = getAdminApi();
    const formData = new FormData();
    formData.append("image", file);
    return API.post(`/admin/site-settings/logo/upload/${adminApi || "admin"}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
}

export function uploadSiteApk(file) {
    const adminApi = getAdminApi();
    const formData = new FormData();
    formData.append("apk", file);
    return API.post(`/admin/site-settings/apk/upload/${adminApi || "admin"}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
}
