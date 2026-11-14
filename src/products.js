import localCatalog from '../public/products.json';
import { normalizeProduct } from './catalog.js';

export const localProducts = localCatalog;

export async function fetchProducts() {
  const { firebaseConfigured, firestore } = await import('./firebase.js');
  if (!firebaseConfigured) return localProducts;

  const { collection, getDocs } = await import('firebase/firestore');
  const snapshot = await getDocs(collection(firestore, 'products'));
  if (snapshot.empty) {
    throw new Error('The Firestore "products" collection is empty. Run npm run seed:products to add the catalog.');
  }

  return snapshot.docs
    .map(productDoc => normalizeProduct(productDoc.id, productDoc.data()))
    .sort((left, right) => (left.sortOrder ?? Number.MAX_SAFE_INTEGER) - (right.sortOrder ?? Number.MAX_SAFE_INTEGER));
}
