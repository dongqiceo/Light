/**
 * 将库里的相对静态路径转为浏览器可请求的完整地址。
 * H5 走 vite proxy；CMS dev 直连 Java 静态服务，避免中文路径在 dev-proxy 下 404。
 */
const STATIC_BASE = (() => {
  if (typeof process !== 'undefined' && process.env?.STATIC_BASE) {
    return process.env.STATIC_BASE.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.protocol}//${window.location.host}`;
  }
  return 'http://localhost:3001';
})();

export function resolveImageUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (
    url.startsWith('/assets') ||
    url.startsWith('/uploads') ||
    url.startsWith('/无主灯清晰图片')
  ) {
    return `${STATIC_BASE}${url}`;
  }
  return url;
}

export function resolveImageList(urls) {
  if (!urls) return [];
  const list = Array.isArray(urls) ? urls : [urls];
  return list.map(resolveImageUrl).filter(Boolean);
}
