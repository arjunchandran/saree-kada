function matchesItem(item, id, size) {
  return item.id === id && item.size === size;
}

export function addBagItem(items, product, size) {
  if (items.some(item => matchesItem(item, product.id, size))) {
    return changeBagQuantity(items, product.id, size, 1);
  }
  return [...items, { id: product.id, name: product.name, price: product.price, color: product.color, size, quantity: 1 }];
}

export function changeBagQuantity(items, id, size, change) {
  return items.flatMap(item => {
    if (!matchesItem(item, id, size)) return [item];
    const quantity = item.quantity + change;
    return quantity > 0 ? [{ ...item, quantity }] : [];
  });
}

export function removeBagItem(items, id, size) {
  return items.filter(item => !matchesItem(item, id, size));
}
