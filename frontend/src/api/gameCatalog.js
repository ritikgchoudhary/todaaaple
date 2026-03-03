import axios from "axios";
import { url } from "./auth";

const API = axios.create({ baseURL: url });

export function fetchGameCatalogPublic() {
  return API.get("/gamesCatalog");
}

export function fetchGameCatalogAdmin(adminApiKey) {
  return API.get(`/gamesCatalogAdmin/${encodeURIComponent(adminApiKey)}`);
}

export function createGameCatalogAdmin(adminApiKey, payload) {
  return API.post(`/gamesCatalogAdmin/${encodeURIComponent(adminApiKey)}`, payload);
}

export function updateGameCatalogAdmin(adminApiKey, id, payload) {
  return API.put(`/gamesCatalogAdmin/${id}/${encodeURIComponent(adminApiKey)}`, payload);
}

export function deleteGameCatalogAdmin(adminApiKey, id) {
  return API.delete(`/gamesCatalogAdmin/${id}/${encodeURIComponent(adminApiKey)}`);
}

