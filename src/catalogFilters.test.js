import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { filterProducts, getCategories } from './catalogFilters.js';

const products = [
  { id: 'saree', 'collective-category': 'Saree', 'product-category': 'Traditional' },
  { id: 'kurti', 'collective-category': 'Kurta/Kurti', 'product-category': 'Casual Wear' },
  { id: 'skirt', 'collective-category': 'Skirt', 'product-category': 'Casual Wear' },
  { id: 'older' }
];

test('categories are unique, sorted, and ignore missing values', () => {
  assert.deepEqual(getCategories(products, 'product-category'), ['Casual Wear', 'Traditional']);
});

test('filters combine garment and occasion, without hiding older products by default', () => {
  assert.equal(filterProducts(products, '', '').length, 4);
  assert.deepEqual(filterProducts(products, 'Kurta/Kurti', 'Casual Wear').map(product => product.id), ['kurti']);
  assert.deepEqual(filterProducts(products, 'Saree', 'Casual Wear'), []);
});
