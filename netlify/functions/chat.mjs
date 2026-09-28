import { buildLittleSreePrompt } from '../../src/chatContext.js';
import { localProducts } from '../../src/products.js';

const systemPrompt = buildLittleSreePrompt(localProducts);

function jsonResponse(statusCode, body) {
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}

export default async function chat(request) {
  if (request.method !== 'POST') {
    return jsonResponse(405, { error: 'Use POST to chat with Little Sree.' });
  }

  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return jsonResponse(503, { error: 'Little Sree is not configured yet. Add GOOGLE_API_KEY to the Netlify site environment.' });
  }

  try {
    const body = await request.json();
    if (!Array.isArray(body.messages)) {
      return jsonResponse(400, { error: 'Send a messages array to chat.' });
    }

    const messages = body.messages
      .filter(message => ['user', 'assistant'].includes(message?.role) && typeof message.content === 'string')
      .slice(-12)
      .map(message => ({ role: message.role, content: message.content.slice(0, 2_000) }));

    if (!messages.length || messages.at(-1).role !== 'user') {
      return jsonResponse(400, { error: 'Send a user message to Little Sree.' });
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
      return jsonResponse(502, { error: 'Little Sree could not reply just now. Please try again in a moment.' });
    }

    return jsonResponse(200, { reply: result.choices?.[0]?.message?.content || 'I do not have an answer for that from the Saree Kada site.' });
  } catch (error) {
    const statusCode = error instanceof SyntaxError ? 400 : 500;
    return jsonResponse(statusCode, {
      error: statusCode === 400 ? 'The chat request was not valid JSON.' : 'Little Sree could not reply just now. Please try again.'
    });
  }
}
