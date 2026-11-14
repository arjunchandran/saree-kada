import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import netlifyChat from '../netlify/functions/chat.mjs';
import vercelChat from '../api/chat.js';

for (const [platform, chat] of [['Netlify', netlifyChat], ['Vercel', vercelChat.fetch]]) {
test(`${platform}: does not call Gemini when configured Firebase catalog cannot be loaded`, async t => {
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

test(`${platform}: returns a formatted response with validated product IDs`, async t => {
  const keys = ['GOOGLE_API_KEY', 'GEMINI_API_KEY', 'VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_STORAGE_BUCKET', 'VITE_FIREBASE_MESSAGING_SENDER_ID', 'VITE_FIREBASE_APP_ID'];
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  t.after(() => {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  });
  for (const key of keys) delete process.env[key];
  process.env.GOOGLE_API_KEY = 'test-key';
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({
    choices: [{ message: { content: JSON.stringify({ reply: '**Kasavu Saree**', productIds: ['kasavu-saree'] }) } }]
  }), { status: 200, headers: { 'content-type': 'application/json' } }));
  const response = await chat(new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'Tell me about the Kasavu Saree' }] })
  }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { reply: '**Kasavu Saree**', productIds: ['kasavu-saree'] });
  const request = JSON.parse(fetchMock.mock.calls[0].arguments[1].body);
  assert.equal(request.response_format.type, 'json_schema');
});

test(`${platform}: rejects invalid methods and malformed JSON`, async t => {
  const previous = process.env.GOOGLE_API_KEY;
  t.after(() => {
    if (previous === undefined) delete process.env.GOOGLE_API_KEY;
    else process.env.GOOGLE_API_KEY = previous;
  });
  process.env.GOOGLE_API_KEY = 'test-key';

  const getResponse = await chat(new Request('http://localhost/api/chat'));
  assert.equal(getResponse.status, 405);

  const badResponse = await chat(new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{'
  }));
  assert.equal(badResponse.status, 400);
  assert.match((await badResponse.json()).error, /not valid JSON/);
});
}
