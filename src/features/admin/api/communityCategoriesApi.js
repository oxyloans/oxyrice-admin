import axiosInstance from "../../../core/config/axiosInstance";

const CATEGORIES_PATH = "/user-service/admin/community/categories";

export const getCommunityCategories = () =>
  axiosInstance.get(CATEGORIES_PATH);

export const createCommunityCategory = (categoryName) =>
  axiosInstance.post(`${CATEGORIES_PATH}/create`, { categoryName });

export const updateCommunityCategory = (categoryId, categoryName, version) =>
  axiosInstance.put(`${CATEGORIES_PATH}/${categoryId}`, {
    categoryName,
    version,
  });

export const updateCommunityCategoryStatus = (categoryId, active) =>
  axiosInstance.patch(`${CATEGORIES_PATH}/${categoryId}/status`, { active });

export const deleteCommunityCategory = (categoryId) =>
  axiosInstance.delete(`${CATEGORIES_PATH}/${categoryId}`);
