export const chatResponseFormat = {
  type: 'json_schema',
  json_schema: {
    name: 'little_sree_reply',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        reply: { type: 'string' },
        productIds: { type: 'array', items: { type: 'string' } }
      },
      required: ['reply', 'productIds'],
      additionalProperties: false
    }
  }
};

export function parseChatResponse(content, catalog) {
  if (typeof content !== 'string') throw new Error('Little Sree returned an empty response.');
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('Little Sree returned invalid JSON.');
  }
  if (!parsed || typeof parsed.reply !== 'string' || !parsed.reply.trim() ||
      !Array.isArray(parsed.productIds) || parsed.productIds.some(id => typeof id !== 'string')) {
    throw new Error('Little Sree returned an invalid response.');
  }
  const knownIds = new Set(catalog.map(product => product.id));
  if (parsed.productIds.some(id => !knownIds.has(id))) {
    throw new Error('Little Sree returned an unknown product.');
  }
  return { reply: parsed.reply.trim(), productIds: [...new Set(parsed.productIds)] };
}
