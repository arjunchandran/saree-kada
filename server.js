import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createServer as createViteServer } from 'vite';

const port = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production' || process.argv.includes('--production');
const catalog = JSON.parse(await readFile(resolve('public/products.json'), 'utf8'));

const siteContext = `
Saree Kada is an independent Kerala saree storefront rooted in Kochi. The site describes its perspective as handwoven clothing with a point of view, designed for movement and made to last. It works with small weaving communities, natural fibers, and patient handwork. Site themes include Kerala craft, everyday ceremony, kasavu borders, Theyyam colour, and considered clothing.

Catalog (use these exact details; prices are Indian rupees):
${catalog.map(product => `- ${product.name}: ${product.price}; color ${product.color}; composition ${product.composition}; woven in ${product.origin}.`).join('\n')}

Other site details: free delivery across India on orders over ₹5,000; the product pages state that a blouse piece is included and recommend cold washing and hanging to dry. Saree Kada's Instagram handle displayed on the site is @auraform.studio. Do not invent stock availability, delivery dates, return policies, contact details, sizing guarantees, or product facts not listed here.

Regional and cultural background for answering questions about history (this is general context, not a verified provenance record for these individual pieces):
- Kasavu Saree (listed origin: Balaramapuram, Kerala): Kasavu refers to the gold-coloured border associated with Kerala's traditional off-white cotton clothing. Kasavu garments are strongly associated with festive and ceremonial dress, including Onam and Vishu. Balaramapuram, in Thiruvananthapuram district, is a long-established handloom-weaving centre known for fine cotton cloth and kasavu borders. The catalog does not identify this saree's weaver, production date, or the precise history of its particular border.
- Handwoven White Set Saree (listed origin: Kuthampully, Kerala): Kuthampully, in Thrissur district, is a recognized handloom village whose cotton weaving tradition is carried by generations of weaving families. Local accounts commonly connect the settlement's weaving community with migration from Karnataka and patronage by the former Cochin royal household; details and dates vary between accounts. The catalog confirms this piece's listed origin and handwoven Kerala cotton composition, but not the individual weaver or a specific family lineage.
- Theyyam Silk Saree (listed origin: Kannur, Kerala): Theyyam is a ritual performance tradition of North Kerala, especially associated with Kannur and Kasaragod, with distinctive vivid colours, elaborate face painting, and ceremonial costume. Its visual language can inspire contemporary textiles, but this product is listed as silk cotton with a hand-finished border; the catalog does not claim that it is a traditional Theyyam costume or that its cloth was used in a ritual.

When asked for history, share the relevant general background above and clearly distinguish it from what the catalog verifies. You may explain well-established, general cultural context about Kerala sarees and handloom weaving, but qualify varying oral traditions and do not invent dates, artisan identities, royal commissions, or a direct historical link between a product and a ritual. If asked for this specific item's maker, exact age, or documented provenance, say the site does not provide that information.
`;

const systemPrompt = `You are Little Sree, Saree Kada's friendly AI chat guide. You answer questions about Saree Kada, its catalog, and relevant Kerala textile and cultural history. Use catalog facts for claims about these specific products and use the clearly labeled regional background for general history. Explain when a detail is general cultural context rather than documented provenance of an individual piece. If a visitor asks about something unrelated to Saree Kada or Kerala textile context, politely steer back to the site. Do not invent product-specific makers, dates, family histories, royal commissions, stock, delivery promises, or policies. Qualify oral traditions where accounts vary. If asked about a product fact not provided, say the site does not specify it. If asked, say clearly that you are an AI assistant, not a human. Keep replies warm, concise, and useful.\n\nSITE CONTEXT:\n${siteContext}`;

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
