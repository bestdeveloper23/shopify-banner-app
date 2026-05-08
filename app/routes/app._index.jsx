import { useFetcher, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const loader = async ({ request }) => {
  const { scopes } = await authenticate.admin(request);
  const scopesDetail = await scopes.query();
  const hasDraftOrderScope = scopesDetail.granted.includes("write_draft_orders");

  return { needsDraftOrderScope: !hasDraftOrderScope };
};

export const action = async ({ request }) => {
  const { scopes } = await authenticate.admin(request);
  const formData = await request.formData();
  if (formData.get("intent") === "request-draft-scope") {
    await scopes.request(["write_draft_orders"]);
    return { draftScopeRequested: true };
  }
  return {};
};

const styles = `
  .bda-dashboard {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    padding: 0;
  }

  .bda-hero {
    background: linear-gradient(135deg, #0d6b58 0%, #0a5245 60%, #073d34 100%);
    border-radius: 16px;
    padding: 40px 48px;
    color: white;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }

  .bda-hero-text h1 {
    font-size: 28px;
    font-weight: 800;
    margin: 0 0 8px 0;
    line-height: 1.2;
    letter-spacing: -0.5px;
  }

  .bda-hero-text p {
    font-size: 15px;
    margin: 0;
    opacity: 0.9;
    max-width: 520px;
    line-height: 1.6;
  }

  .bda-hero-badge {
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: 50px;
    padding: 8px 20px;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    backdrop-filter: blur(8px);
  }

  .bda-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }

  .bda-stat-card {
    background: white;
    border: 1px solid #e8eaed;
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(13,107,88,0.06);
  }

  .bda-stat-icon { font-size: 28px; margin-bottom: 8px; }

  .bda-stat-label {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  .bda-stat-value {
    font-size: 22px;
    font-weight: 800;
    color: #0d6b58;
  }

  .bda-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }

  .bda-card {
    background: white;
    border: 1px solid #e8eaed;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(13,107,88,0.04);
  }

  .bda-card h3 {
    font-size: 15px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 16px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .bda-steps { display: flex; flex-direction: column; gap: 12px; }

  .bda-step {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .bda-step-num {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #0d6b58;
    color: white;
    font-size: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .bda-step-text strong {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 2px;
  }

  .bda-step-text span {
    font-size: 12px;
    color: #6b7280;
    line-height: 1.5;
  }

  .bda-checklist { display: flex; flex-direction: column; gap: 10px; }

  .bda-check-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 13px;
    color: #374151;
    line-height: 1.5;
  }

  .bda-check-dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #dcfce7;
    border: 1.5px solid #16a34a;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 10px;
    margin-top: 1px;
  }

  .bda-features {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 24px;
  }

  .bda-feature {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    background: white;
    border: 1px solid #e8eaed;
    border-radius: 10px;
    padding: 16px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }

  .bda-feature-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: #ecfdf5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }

  .bda-feature-text strong {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 2px;
  }

  .bda-feature-text span { font-size: 12px; color: #6b7280; }

  .bda-scope-card {
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: 12px;
    padding: 20px 24px;
    margin-bottom: 24px;
  }

  .bda-scope-card h3 {
    font-size: 14px;
    font-weight: 700;
    color: #92400e;
    margin: 0 0 6px 0;
  }

  .bda-scope-card p {
    font-size: 13px;
    color: #78350f;
    margin: 0 0 14px 0;
    line-height: 1.5;
  }

  .bda-btn-primary {
    background: #0d6b58;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .bda-btn-primary:hover { background: #0a5245; }
`;

export default function Index() {
  const { needsDraftOrderScope } = useLoaderData() || {};
  const scopeFetcher = useFetcher();

  return (
    <>
      <style>{styles}</style>
      <s-page heading="Banner Design Preview">
        <div className="bda-dashboard">
          {needsDraftOrderScope && (
            <div className="bda-scope-card">
              <h3>Action required: draft orders</h3>
              <p>
                Grant <strong>write_draft_orders</strong> so customers can check
                out when their banner size does not match a preset variant (draft
                checkout from the designer).
              </p>
              <scopeFetcher.Form method="post">
                <input type="hidden" name="intent" value="request-draft-scope" />
                <button
                  type="submit"
                  className="bda-btn-primary"
                  disabled={scopeFetcher.state !== "idle"}
                >
                  {scopeFetcher.state !== "idle"
                    ? "Requesting…"
                    : "Grant draft order permission"}
                </button>
              </scopeFetcher.Form>
            </div>
          )}

          <div className="bda-hero">
            <div className="bda-hero-text">
              <h1>Banner Design Preview</h1>
              <p>
                Let customers upload art, place grommets, and preview banners on
                your storefront — then add to cart with dimensions and proof
                passed through to orders.
              </p>
            </div>
            <div className="bda-hero-badge">Theme app extension</div>
          </div>

          <div className="bda-stats">
            <div className="bda-stat-card">
              <div className="bda-stat-icon">📐</div>
              <div className="bda-stat-label">Designer</div>
              <div className="bda-stat-value">Live</div>
            </div>
            <div className="bda-stat-card">
              <div className="bda-stat-icon">🖼️</div>
              <div className="bda-stat-label">Proof</div>
              <div className="bda-stat-value">Cart</div>
            </div>
            <div className="bda-stat-card">
              <div className="bda-stat-icon">🛒</div>
              <div className="bda-stat-label">Draft order</div>
              <div className="bda-stat-value">Custom size</div>
            </div>
          </div>

          <div className="bda-grid">
            <div className="bda-card">
              <h3>How it works</h3>
              <div className="bda-steps">
                <div className="bda-step">
                  <div className="bda-step-num">1</div>
                  <div className="bda-step-text">
                    <strong>Tag products</strong>
                    <span>
                      Add the &quot;Banner Designer&quot; tag (or your chosen tag
                      from the theme block) to products that should show the
                      designer.
                    </span>
                  </div>
                </div>
                <div className="bda-step">
                  <div className="bda-step-num">2</div>
                  <div className="bda-step-text">
                    <strong>Theme block</strong>
                    <span>
                      Add the Banner designer block to the product template and
                      set the designer URL (default: Design Preview Tool on
                      Replit).
                    </span>
                  </div>
                </div>
                <div className="bda-step">
                  <div className="bda-step-num">3</div>
                  <div className="bda-step-text">
                    <strong>Variants</strong>
                    <span>
                      Use width × height (inches) on option 1 and 2, plus a Custom
                      Size variant for non-matching dimensions.
                    </span>
                  </div>
                </div>
                <div className="bda-step">
                  <div className="bda-step-num">4</div>
                  <div className="bda-step-text">
                    <strong>Cart block</strong>
                    <span>
                      Add Cart banner images in the cart template so line items
                      show the proof thumbnail and hide internal properties.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bda-card">
              <h3>Setup checklist</h3>
              <div className="bda-checklist">
                {[
                  "App proxy prefix `apps` / subpath `banner-preview` matches shopify.app.toml",
                  "Design Preview Tool allows your store origin (ALLOWED_EMBED_ORIGINS)",
                  "DATABASE_URL set; run prisma migrate deploy on deploy",
                  "Cart: add Cart banner images block",
                  "Test a product with the Banner designer tag",
                ].map((item, i) => (
                  <div key={i} className="bda-check-item">
                    <div className="bda-check-dot">✓</div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bda-features">
            {[
              {
                icon: "📏",
                title: "Preset + custom sizes",
                desc: "Variant map + draft order path for one-off dimensions",
              },
              {
                icon: "🔩",
                title: "Grommets & summary",
                desc: "Line item properties for production handoff",
              },
              {
                icon: "🧾",
                title: "App proxy pricing",
                desc: "BANNER_PRICE_PER_3_5_SQFT for 3.5 sq ft billing steps",
              },
              {
                icon: "🔒",
                title: "Designer allowlist",
                desc: "Proxy only forwards allowed designer origins",
              },
            ].map((f, i) => (
              <div key={i} className="bda-feature">
                <div className="bda-feature-icon">{f.icon}</div>
                <div className="bda-feature-text">
                  <strong>{f.title}</strong>
                  <span>{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </s-page>
    </>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
