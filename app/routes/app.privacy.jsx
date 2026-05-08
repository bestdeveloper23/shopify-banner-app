export default function PrivacyPage() {
  return (
    <s-page heading="Privacy Policy">
      <s-section heading="Overview">
        <s-paragraph>
          Banner Design Preview is committed to protecting your privacy and the
          privacy of your customers. This policy explains what data we collect,
          how we use it, and how we keep it safe.
        </s-paragraph>
      </s-section>

      <s-section heading="What Data We Collect">
        <s-unordered-list>
          <s-list-item>
            <strong>Shop data:</strong> Your Shopify store URL and access token
            to authenticate and run the app.
          </s-list-item>
          <s-list-item>
            <strong>Customer data:</strong> When the banner designer runs in your
            storefront, identifiers needed for checkout and design handoff may be
            passed to your configured designer host (see theme block settings).
          </s-list-item>
          <s-list-item>
            <strong>Order data:</strong> Banner dimensions, grommet summary,
            preview image URLs, and reference codes saved as line item properties.
          </s-list-item>
          <s-list-item>
            <strong>Design data:</strong> Files and previews processed by the
            external Design Preview Tool (or your configured designer URL).
          </s-list-item>
        </s-unordered-list>
      </s-section>

      <s-section heading="How We Use Your Data">
        <s-unordered-list>
          <s-list-item>
            To authenticate your store and run the app securely.
          </s-list-item>
          <s-list-item>
            To create draft orders for custom banner sizes when preset variants do
            not match.
          </s-list-item>
          <s-list-item>
            To show banner proof thumbnails in the cart when your theme includes the
            Cart banner images block.
          </s-list-item>
        </s-unordered-list>
      </s-section>

      <s-section heading="Data Retention">
        <s-paragraph>
          Session data is stored in our database and is removed when the app is
          uninstalled from your store. Design assets follow the retention policy of
          the designer service you configure.
        </s-paragraph>
      </s-section>

      <s-section heading="Third Party Services">
        <s-paragraph>
          This app relies on an external banner designer (default: Design Preview
          Tool). Review that service’s privacy policy for how customer and design
          data is handled.
        </s-paragraph>
      </s-section>

      <s-section heading="Your Rights">
        <s-paragraph>
          You may request deletion of your store&apos;s data by uninstalling the
          app or contacting the developer. Customer data requests can be handled
          through Shopify&apos;s processes.
        </s-paragraph>
      </s-section>

      <s-section slot="aside" heading="Contact">
        <s-paragraph>
          For privacy questions, contact the app developer through the Shopify App
          Store listing.
        </s-paragraph>
      </s-section>
    </s-page>
  );
}
