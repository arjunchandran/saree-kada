import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { loadChatCatalog } from './chatCatalog.js';
import { buildLittleSreePrompt } from './chatContext.js';

test('uses the preview catalog only when no Firebase web config is supplied', async () => {
  const catalog = await loadChatCatalog({});
  assert.ok(catalog.some(product => product.id === 'kasavu-saree'));
  await assert.rejects(loadChatCatalog({ VITE_FIREBASE_PROJECT_ID: 'my-project' }), /incomplete/);
  await assert.rejects(loadChatCatalog({ VITE_FIREBASE_API_KEY: 'your-web-api-key', VITE_FIREBASE_PROJECT_ID: 'my-project', VITE_FIREBASE_APP_ID: 'app' }), /placeholders/);
});

test('prompt includes the KishabySree Instagram handle', () => {
  assert.match(buildLittleSreePrompt([]), /@kishabysree\b/);
});

test('prompt uses current catalog categories and labels demo products', () => {
  const prompt = buildLittleSreePrompt([{
    id: 'new-shirt',
    name: 'New Shirt',
    price: '₹1,234',
    color: 'Blue',
    composition: 'Cotton',
    origin: 'Demo product',
    'collective-category': 'Shirt',
    'product-category': 'Office Wear',
    description: 'Example only',
    demo: true
  }]);
  assert.match(prompt, /"name":"New Shirt"/);
  assert.match(prompt, /"price":"₹1,234"/);
  assert.match(prompt, /"collective-category":"Shirt"/);
  assert.match(prompt, /"product-category":"Office Wear"/);
  assert.match(prompt, /"demo":true/);
  assert.match(prompt, /not real items for sale/);
  assert.doesNotMatch(prompt, /The catalog confirms this piece/);
});
