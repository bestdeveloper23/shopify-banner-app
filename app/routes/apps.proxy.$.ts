import { json } from "react-router";
import { authenticate } from "../shopify.server";

/** Square feet covered by one price increment (client: bill by 3.5 sq ft). */
const SQFT_PER_PRICE_UNIT = 3.5;

/**
 * Draft-order line price: ceil(area_sqft / 3.5) × rate.
 * Set `BANNER_PRICE_PER_3_5_SQFT` (USD) on the app host to match the merchant’s catalog.
 */
function calculateBannerPrice(widthInches: number, heightInches: number): number {
  const w = Math.max(0.5, Number(widthInches) || 36);
  const h = Math.max(0.5, Number(heightInches) || 72);
  const areaSqFt = (w * h) / 144;
  const increments = Math.max(1, Math.ceil(areaSqFt / SQFT_PER_PRICE_UNIT));
  const usdPerIncrement = Number(process.env.BANNER_PRICE_PER_3_5_SQFT);
  const rate =
    Number.isFinite(usdPerIncrement) && usdPerIncrement > 0 ? usdPerIncrement : 28;
  return Math.round(increments * rate * 100) / 100;
}

export const action = async ({ request }) => {
  const url = new URL(request.url);
  if (request.method !== "POST" || !url.pathname.endsWith("create-draft")) {
    return json({ error: "Method or path not allowed" }, { status: 400 });
  }

  const { admin } = await authenticate.public.appProxy(request);
  if (!admin) {
    return json(
      { error: "Store session not available. Ensure the app is installed." },
      { status: 503 }
    );
  }

  let body: {
    variantId?: string;
    quantity?: number;
    widthInches?: number;
    heightInches?: number;
    properties?: Record<string, string>;
  };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const variantId = body.variantId;
  const quantity = body.quantity ?? 1;
  const widthInches = body.widthInches ?? 36;
  const heightInches = body.heightInches ?? 72;
  if (!variantId) {
    return json({ error: "variantId is required" }, { status: 400 });
  }

  const price = calculateBannerPrice(widthInches, heightInches);
  const variantGid =
    variantId.startsWith("gid://") ? variantId : `gid://shopify/ProductVariant/${variantId}`;

  const customAttributes: { key: string; value: string }[] = [];
  if (body.properties) {
    for (const [k, v] of Object.entries(body.properties)) {
      if (v != null && v !== "") customAttributes.push({ key: k, value: String(v) });
    }
  }

  const lineItems: {
    variantId: string;
    quantity: number;
    customAttributes?: { key: string; value: string }[];
    priceOverride?: { amount: string; currencyCode: string };
  }[] = [
    {
      variantId: variantGid,
      quantity: Math.max(1, quantity),
      priceOverride: { amount: String(price), currencyCode: "USD" },
      ...(customAttributes.length ? { customAttributes } : {}),
    },
  ];

  let result: {
    data?: {
      draftOrderCreate?: {
        draftOrder?: { invoiceUrl?: string };
        userErrors?: { message: string }[];
      };
    };
    errors?: { message: string }[];
  };
  try {
    const response = await admin.graphql(
      `#graphql
    mutation draftOrderCreate($input: DraftOrderInput!) {
      draftOrderCreate(input: $input) {
        draftOrder {
          id
          invoiceUrl
        }
        userErrors {
          message
          field
        }
      }
    }`,
      {
        variables: {
          input: {
            lineItems,
          },
        },
      }
    );
    result = await response.json();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/scope|permission|access/i.test(msg)) {
      return json(
        {
          error:
            "This app needs permission to create draft orders. Uninstall the app and reinstall it from your Shopify admin, then try again.",
        },
        { status: 403 }
      );
    }
    throw err;
  }

  const graphqlErrors = result?.errors || [];
  const scopeError = graphqlErrors.find((e: { message: string }) =>
    /scope|permission|access/i.test(e?.message || "")
  );
  if (scopeError) {
    return json(
      {
        error:
          "This app needs permission to create draft orders. Uninstall the app and reinstall it from your Shopify admin, then try again.",
      },
      { status: 403 }
    );
  }

  const data = result?.data?.draftOrderCreate;
  const userErrors = data?.userErrors || [];
  if (userErrors.length > 0) {
    return json(
      { error: userErrors.map((e: { message: string }) => e.message).join(", ") },
      { status: 400 }
    );
  }

  const invoiceUrl = data?.draftOrder?.invoiceUrl;
  if (!invoiceUrl) {
    return json({ error: "Draft order created but no invoice URL" }, { status: 500 });
  }

  return json({ checkoutUrl: invoiceUrl });
};

export const loader = async ({ request }) => {
  await authenticate.public.appProxy(request);
  return json({ ok: true, message: "Use POST to create-draft" });
};
