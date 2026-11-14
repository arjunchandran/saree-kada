export function normalizeProduct(id, data) {
  const requiredTextFields = ['name', 'price', 'color', 'composition', 'origin'];
  for (const field of requiredTextFields) {
    if (typeof data[field] !== 'string' || !data[field].trim()) {
      throw new Error(`Product "${id}" has an invalid "${field}" value.`);
    }
  }
  if (!Array.isArray(data.images) || data.images.length === 0 || data.images.some(image => typeof image !== 'string' || !image.trim())) {
    throw new Error(`Product "${id}" must have at least one valid image URL.`);
  }

  return { ...data, id, images: data.images };
}
