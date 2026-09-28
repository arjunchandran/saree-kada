import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createServer as createViteServer } from 'vite';
import { buildLittleSreePrompt } from './src/chatContext.js';

const port = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production' || process.argv.includes('--production');
const catalog = JSON.parse(await readFile(resolve('public/products.json'), 'utf8'));

const systemPrompt = buildLittleSreePrompt(catalog);

function sendJson(response, status, data) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(data));
}

async function readJsonBody(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 20_000) throw new Error('Request is too large.');
  }
  return JSON.parse(body || '{}');
}

async function handleChat(request, response) {
  if (request.method !== 'POST') {
    sendJson(response, 405, { error: 'Use POST to chat with Little Sree.' });
    return;
  }

  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    sendJson(response, 503, { error: 'Little Sree is not configured yet. Add GOOGLE_API_KEY to the server environment.' });
    return;
  }

  try {
    const body = await readJsonBody(request);
    if (!Array.isArray(body.messages)) {
      sendJson(response, 400, { error: 'Send a messages array to chat.' });
      return;
    }

    const messages = body.messages
      .filter(message => ['user', 'assistant'].includes(message?.role) && typeof message.content === 'string')
      .slice(-12)
      .map(message => ({ role: message.role, content: message.content.slice(0, 2_000) }));

    if (!messages.length || messages.at(-1).role !== 'user') {
      sendJson(response, 400, { error: 'Send a user message to Little Sree.' });
      return;
    }

    const upstream = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: process.env.GOOGLE_MODEL || 'gemini-3.5-flash-lite',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.4,
        max_tokens: 500
      }),
      signal: AbortSignal.timeout(30_000)
    });
    const result = await upstream.json();
    if (!upstream.ok) {
      const providerError = Array.isArray(result?.error) ? result.error[0]?.error : result?.error;
      console.error('Gemini request failed:', upstream.status, providerError?.message || result?.detail || result?.message || 'Unknown API error');
      sendJson(response, 502, { error: 'Little Sree could not reply just now. Please try again in a moment.' });
      return;
    }

    sendJson(response, 200, { reply: result.choices?.[0]?.message?.content || 'I do not have an answer for that from the Saree Kada site.' });
  } catch (error) {
    const status = error instanceof SyntaxError ? 400 : 500;
    sendJson(response, status, { error: status === 400 ? 'The chat request was not valid JSON.' : 'Little Sree could not reply just now. Please try again.' });
  }
}

const vite = isProduction ? null : await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, `http://${request.headers.host || 'localhost'}`).pathname;
  if (pathname === '/api/chat') {
    await handleChat(request, response);
    return;
  }

  if (vite) {
    vite.middlewares(request, response, error => {
      if (error) {
        console.error(error);
        sendJson(response, 500, { error: 'The site could not be served.' });
      }
    });
    return;
  }

  try {
    const requestedPath = pathname === '/' ? '/index.html' : pathname;
    const filePath = resolve('dist', `.${requestedPath}`);
    const file = await readFile(filePath).catch(() => readFile(resolve('dist/index.html')));
    const contentType = filePath.endsWith('.css') ? 'text/css' : filePath.endsWith('.js') ? 'text/javascript' : filePath.endsWith('.json') ? 'application/json' : 'text/html';
    response.writeHead(200, { 'content-type': `${contentType}; charset=utf-8` });
    response.end(file);
  } catch {
    sendJson(response, 500, { error: 'The site could not be served.' });
  }
});

server.listen(port, () => console.log(`Saree Kada${isProduction ? '' : ' development'} server ready at http://localhost:${port}`));
