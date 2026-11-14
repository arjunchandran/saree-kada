import { readFile } from 'node:fs/promises';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID;
if (!projectId) {
  throw new Error('Set FIREBASE_PROJECT_ID in .env before seeding the catalog.');
}
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  throw new Error('Set GOOGLE_APPLICATION_CREDENTIALS to your local service-account JSON file.');
}

const products = JSON.parse(await readFile(new URL('../public/products.json', import.meta.url), 'utf8'));
if (!Array.isArray(products) || products.length === 0) {
  throw new Error('public/products.json must contain at least one product.');
}

initializeApp({ credential: applicationDefault(), projectId });
const firestore = getFirestore();
const batch = firestore.batch();

for (const [sortOrder, product] of products.entries()) {
  if (!product.id || !Array.isArray(product.images)) {
    throw new Error(`Product at index ${sortOrder} is missing an id or images array.`);
  }
  const { id, ...fields } = product;
  batch.set(firestore.doc(`products/${id}`), { ...fields, sortOrder });
}

await batch.commit();
console.log(`Seeded ${products.length} products into Firebase project "${projectId}".`);
console.log('Image URL references were saved to Firestore; image files were not uploaded to Storage.');
