export function getCategories(products, field) {
  return [...new Set(products.map(product => product[field]).filter(value => typeof value === 'string' && value.trim()))]
    .sort((left, right) => left.localeCompare(right));
}

export function filterProducts(products, collectiveCategory, productCategory) {
  return products.filter(product =>
    (!collectiveCategory || product['collective-category'] === collectiveCategory) &&
    (!productCategory || product['product-category'] === productCategory)
  );
}
