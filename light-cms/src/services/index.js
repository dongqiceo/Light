import { request } from '@umijs/max';

const BASE_SERVICE = '/light-cms';

async function sendRequest(url, { method, data, params }) {
  return request(url, { method, data, params });
}

/** 分类管理 **/
export async function fetchCategoryList(data) {
  return sendRequest(`${BASE_SERVICE}/category/list`, { method: 'POST', data });
}

export async function fetchCategoryListAll() {
  return sendRequest(`${BASE_SERVICE}/category/listAll`, { method: 'POST', data: {} });
}

export async function saveCategory(data) {
  return sendRequest(`${BASE_SERVICE}/category/save`, { method: 'POST', data });
}

export async function deleteCategory(data) {
  return sendRequest(`${BASE_SERVICE}/category/delete`, { method: 'POST', data });
}

export async function updateCategoryStatus(data) {
  return sendRequest(`${BASE_SERVICE}/category/updateStatus`, { method: 'POST', data });
}

/** 产品管理 **/
export async function fetchProductList(data) {
  return sendRequest(`${BASE_SERVICE}/product/list`, { method: 'POST', data });
}

export async function fetchProductListAll() {
  return sendRequest(`${BASE_SERVICE}/product/listAll`, { method: 'POST', data: {} });
}

export async function fetchProductDetail(data) {
  return sendRequest(`${BASE_SERVICE}/product/detail`, { method: 'POST', data });
}

export async function saveProduct(data) {
  return sendRequest(`${BASE_SERVICE}/product/save`, { method: 'POST', data });
}

export async function deleteProduct(data) {
  return sendRequest(`${BASE_SERVICE}/product/delete`, { method: 'POST', data });
}

export async function updateProductStatus(data) {
  return sendRequest(`${BASE_SERVICE}/product/updateStatus`, { method: 'POST', data });
}

/** 轮播图管理 **/
export async function fetchCarouselList(data) {
  return sendRequest(`${BASE_SERVICE}/carousel/list`, { method: 'POST', data });
}

export async function saveCarousel(data) {
  return sendRequest(`${BASE_SERVICE}/carousel/save`, { method: 'POST', data });
}

export async function deleteCarousel(data) {
  return sendRequest(`${BASE_SERVICE}/carousel/delete`, { method: 'POST', data });
}

export async function updateCarouselStatus(data) {
  return sendRequest(`${BASE_SERVICE}/carousel/updateStatus`, { method: 'POST', data });
}

/** 精选产品管理 **/
export async function fetchFeaturedList(data) {
  return sendRequest(`${BASE_SERVICE}/featured/list`, { method: 'POST', data });
}

export async function saveFeatured(data) {
  return sendRequest(`${BASE_SERVICE}/featured/save`, { method: 'POST', data });
}

export async function deleteFeatured(data) {
  return sendRequest(`${BASE_SERVICE}/featured/delete`, { method: 'POST', data });
}

/** 联系留言（H5 表单） **/
export async function fetchContactMessageList(data) {
  return sendRequest(`${BASE_SERVICE}/contact-message/list`, { method: 'POST', data });
}

export async function fetchContactMessageDetail(data) {
  return sendRequest(`${BASE_SERVICE}/contact-message/detail`, { method: 'POST', data });
}

export async function deleteContactMessage(data) {
  return sendRequest(`${BASE_SERVICE}/contact-message/delete`, { method: 'POST', data });
}

/** 关于我们（联系信息） **/
export async function fetchSettings() {
  return sendRequest(`${BASE_SERVICE}/settings/get`, { method: 'POST', data: {} });
}

export async function saveSettings(data) {
  return sendRequest(`${BASE_SERVICE}/settings/save`, { method: 'POST', data });
}

/** 语言管理 **/
export async function fetchLanguageList(data) {
  return sendRequest(`${BASE_SERVICE}/language/list`, { method: 'POST', data });
}

export async function fetchLanguageListAll() {
  return sendRequest(`${BASE_SERVICE}/language/listAll`, { method: 'POST', data: {} });
}

export async function saveLanguage(data) {
  return sendRequest(`${BASE_SERVICE}/language/save`, { method: 'POST', data });
}

export async function deleteLanguage(data) {
  return sendRequest(`${BASE_SERVICE}/language/delete`, { method: 'POST', data });
}

/** 翻译管理 **/
export async function fetchI18nList(data) {
  return sendRequest(`${BASE_SERVICE}/i18n/list`, { method: 'POST', data });
}

export async function fetchI18nListAll() {
  return sendRequest(`${BASE_SERVICE}/i18n/listAll`, { method: 'POST', data: {} });
}

export async function saveI18n(data) {
  return sendRequest(`${BASE_SERVICE}/i18n/save`, { method: 'POST', data });
}

export async function deleteI18n(data) {
  return sendRequest(`${BASE_SERVICE}/i18n/delete`, { method: 'POST', data });
}

export default {
  fetchCategoryList,
  fetchCategoryListAll,
  saveCategory,
  deleteCategory,
  updateCategoryStatus,
  fetchProductList,
  fetchProductListAll,
  fetchProductDetail,
  saveProduct,
  deleteProduct,
  updateProductStatus,
  fetchCarouselList,
  saveCarousel,
  deleteCarousel,
  updateCarouselStatus,
  fetchFeaturedList,
  saveFeatured,
  deleteFeatured,
  fetchContactMessageList,
  fetchContactMessageDetail,
  deleteContactMessage,
  fetchSettings,
  saveSettings,
  fetchLanguageList,
  fetchLanguageListAll,
  saveLanguage,
  deleteLanguage,
  fetchI18nList,
  fetchI18nListAll,
  saveI18n,
  deleteI18n,
};
