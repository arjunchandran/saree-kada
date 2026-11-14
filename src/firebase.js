import { getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isConfiguredValue = value =>
  typeof value === 'string' &&
  value.trim() !== '' &&
  !/^(your[-_ ]|placeholder\b|change[-_ ]me\b)/i.test(value.trim());

const requiredConfigKeys = ['apiKey', 'projectId', 'appId'];
const suppliedKeys = Object.keys(firebaseConfig).filter(key => firebaseConfig[key]);
const missingRequiredKeys = requiredConfigKeys.filter(key => !isConfiguredValue(firebaseConfig[key]));

if (suppliedKeys.length && missingRequiredKeys.length) {
  throw new Error(`Firebase configuration is incomplete or contains placeholders. Set valid values for: ${missingRequiredKeys.join(', ')}.`);
}

export const firebaseConfigured = requiredConfigKeys.every(key => isConfiguredValue(firebaseConfig[key]));
const app = firebaseConfigured
  ? getApps()[0] || initializeApp(firebaseConfig)
  : null;

export const firestore = app ? getFirestore(app) : null;
