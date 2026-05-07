import { authenticate } from "../shopify.server";

/**
 * Banner app: no commission billing hook by default (add your own fulfillment logic here).
 */
export const action = async ({ request }) => {
  if (request.method !== "POST") return new Response(null, { status: 405 });

  const { shop } = await authenticate.webhook(request);
  if (!shop) return new Response(null, { status: 401 });

  return new Response(null, { status: 200 });
};
