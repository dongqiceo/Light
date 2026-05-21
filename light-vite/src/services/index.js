import request from '../utils/request';
import { getCurrentLocale } from '../i18n';

function withLocale(data = {}) {
  return { locale: getCurrentLocale(), ...data };
}

export function getFeaturedProducts(params) {
  return request({
    url: '/products/featured',
    method: 'post',
    data: withLocale(params || {}),
  });
}

export function getProductCategories() {
  return request({ url: '/product-categories', method: 'post', data: withLocale() });
}

export function getProductsByCategory(categoryId, params) {
  return request({
    url: '/products/detail',
    method: 'post',
    data: withLocale({ categoryId, ...params }),
  });
}

export function getProductDetail(categoryId, productId) {
  return request({
    url: '/products/detail',
    method: 'post',
    data: withLocale({ categoryId, productId: productId || undefined }),
  });
}

export function submitContactForm(data) {
  return request({ url: '/contact', method: 'post', data });
}

export function getSiteSettings() {
  return request({ url: '/settings', method: 'post', data: withLocale() });
}

