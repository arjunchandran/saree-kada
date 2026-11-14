import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { addBagItem, changeBagQuantity, removeBagItem } from './bag.js';

const saree = { id: 'saree', name: 'Saree', price: '₹1,000', color: 'White' };
const shirt = { id: 'shirt', name: 'Shirt', price: '₹500', color: 'Blue' };

test('adding the same product and size increments only that entry', () => {
  let items = addBagItem([], saree, '5.5m');
  items = addBagItem(items, saree, '6m');
  items = addBagItem(items, saree, '5.5m');
  items = addBagItem(addBagItem(items, shirt), shirt);

  assert.deepEqual(items.map(({ id, size, quantity }) => ({ id, size, quantity })), [
    { id: 'saree', size: '5.5m', quantity: 2 },
    { id: 'saree', size: '6m', quantity: 1 },
    { id: 'shirt', size: undefined, quantity: 2 }
  ]);
});

test('quantity changes and removal affect only the selected size', () => {
  let items = addBagItem(addBagItem([], saree, '5.5m'), saree, '6m');
  items = changeBagQuantity(items, 'saree', '5.5m', 1);
  items = changeBagQuantity(items, 'saree', '5.5m', -1);
  assert.deepEqual(items.map(item => item.quantity), [1, 1]);

  const removedByDecrement = changeBagQuantity(items, 'saree', '5.5m', -1);
  assert.deepEqual(removedByDecrement.map(item => item.size), ['6m']);
  assert.deepEqual(removeBagItem(items, 'saree', '6m').map(item => item.size), ['5.5m']);
});
