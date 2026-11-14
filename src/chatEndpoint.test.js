import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import chat from '../netlify/functions/chat.mjs';

test('does not call Gemini when configured Firebase catalog cannot be loaded', async t => {
  const keys = ['GOOGLE_API_KEY', 'GEMINI_API_KEY', 'VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_APP_ID'];
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  t.after(() => {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  });
  process.env.GOOGLE_API_KEY = 'test-key';
  process.env.VITE_FIREBASE_API_KEY = 'your-web-api-key';
  process.env.VITE_FIREBASE_PROJECT_ID = 'test-project';
  process.env.VITE_FIREBASE_APP_ID = 'test-app';
  const fetchMock = t.mock.method(globalThis, 'fetch');
  const errorLog = t.mock.method(console, 'error', () => {});
  const request = new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'What products are there?' }] })
  });

  const response = await chat(request);
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /cannot access the live product catalog/);
  assert.equal(fetchMock.mock.callCount(), 0);
  assert.equal(errorLog.mock.callCount(), 1);
});
