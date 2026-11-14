import { getApps, initializeApp } from 'firebase/app';
import { collection, getDocsFromServer, getFirestore } from 'firebase/firestore';
import localCatalog from '../public/products.json' with { type: 'json' };
import { normalizeProduct } from './catalog.js';

export async function loadChatCatalog(env = process.env) {
  const config = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID
  };
  if (Object.values(config).every(value => !value)) return localCatalog;
  const requiredValues = [config.apiKey, config.projectId, config.appId];
  if (requiredValues.some(value => typeof value !== 'string' || !value.trim() || /^(your[-_ ]|placeholder\b|change[-_ ]me\b)/i.test(value.trim()))) {
    throw new Error('Firebase web configuration is incomplete or contains placeholders.');
  }

  const app = getApps().find(existing => existing.name === 'little-sree-catalog') || initializeApp(config, 'little-sree-catalog');
  const snapshot = await getDocsFromServer(collection(getFirestore(app), 'products'));
  if (snapshot.empty) throw new Error('The Firestore products collection is empty.');
  return snapshot.docs.map(product => normalizeProduct(product.id, product.data()));
}
