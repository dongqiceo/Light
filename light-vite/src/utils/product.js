export function getCategoryLabel(cat, t) {
  if (cat.displayNameKey) return t(cat.displayNameKey);
  return cat.displayName || cat.name;
}

export function getProductName(product, t) {
  if (product.name?.startsWith?.('products.')) return t(product.name);
  return product.name;
}

export function getProductImage(product) {
  if (product.image) return product.image;
  const img = product.images?.[0];
  if (typeof img === 'string' && (img.startsWith('http') || img.startsWith('/'))) return img;
  return product.image;
}

export function getDisplayItems(category, t) {
  if (category.products?.length) return category.products;
  const name = getCategoryLabel(category, t);
  return (category.images || []).map((img) => ({
    images: [img],
    name,
  }));
}

export function getImageUrl(category, item) {
  const img = item.images?.[0] ?? item;
  if (typeof img === 'string' && (img.startsWith('http') || img.startsWith('/'))) return img;
  if (typeof img === 'string' && category?.folderName) {
    return `/无主灯清晰图片/${category.folderName}/${img}`;
  }
  return img;
}

export function getDetailImagePath(imageName, folderName) {
  if (!imageName) return '';
  if (typeof imageName === 'string' && imageName.startsWith('http')) return imageName;
  if (typeof imageName === 'string' && imageName.startsWith('/')) return imageName;
  return `/无主灯清晰图片/${folderName}/${imageName}`;
}

export function joinSpec(arr) {
  return arr.map((item) => item.label || item.value || item.name).join(' / ');
}
