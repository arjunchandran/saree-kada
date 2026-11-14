import { buildLittleSreePrompt } from '../../src/chatContext.js';
import { loadChatCatalog } from '../../src/chatCatalog.js';
import { chatResponseFormat, parseChatResponse } from '../../src/chatResponse.js';

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
    return jsonResponse(503, { error: 'Little Sree is not configured yet. Add GOOGLE_API_KEY to the server environment.' });
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

    let catalog;
    try {
      catalog = await loadChatCatalog();
    } catch (error) {
      console.error('Little Sree could not load the product catalog:', error);
      return jsonResponse(503, { error: 'Little Sree cannot access the live product catalog right now. Please try again.' });
    }

    const upstream = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: process.env.GOOGLE_MODEL || 'gemini-3.5-flash-lite',
        messages: [{ role: 'system', content: buildLittleSreePrompt(catalog) }, ...messages],
        response_format: chatResponseFormat,
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

    try {
      return jsonResponse(200, parseChatResponse(result.choices?.[0]?.message?.content, catalog));
    } catch (error) {
      console.error('Little Sree returned an invalid response:', error);
      return jsonResponse(502, { error: 'Little Sree could not prepare a response. Please try again.' });
    }
  } catch (error) {
    const statusCode = error instanceof SyntaxError ? 400 : 500;
    if (statusCode === 500) console.error('Little Sree request failed:', error);
    return jsonResponse(statusCode, {
      error: statusCode === 400 ? 'The chat request was not valid JSON.' : 'Little Sree could not reply just now. Please try again.'
    });
  }
}
