# Firebase product catalog setup

The React app reads product documents from the Firestore `products` collection when Firebase web configuration is present. Without that configuration, it uses the local catalog so the site remains usable during setup.

## Create and configure the Firebase project

1. Create a Firebase project in the Firebase console and register a Web app.
2. Create a Cloud Firestore database.
3. Copy `.env.example` to `.env`. Fill in the complete Web app config from Firebase project settings, including the API key, sender ID, and app ID. These values are public client configuration; the service-account JSON is a separate, privileged server credential and cannot be used in their place. Placeholder values do not connect the storefront.
4. In the Firebase console's Firestore Rules tab, publish the contents of `firestore.rules`. This lets the storefront read products while preventing writes from public clients.
5. In Google Cloud IAM, create a service account with permission to write Firestore documents. Download its JSON key outside the repository, and set `GOOGLE_APPLICATION_CREDENTIALS` in `.env` to that file's absolute path. Never put the key in a `VITE_*` variable or commit it.

## Seed the current catalog

Install dependencies and seed the products:

```sh
npm install
npm run seed:products
```

The script imports `public/products.json` into Firestore as one document per product, using each product ID as the document ID. It stores `name`, `price`, `color`, `composition`, `origin`, `collective-category`, `product-category`, `images`, and `sortOrder`. The current `images` values are external Pexels/Unsplash URL references, so this step does not copy image files into Firebase Storage.

The homepage garment links and the shop's garment and occasion filters are derived from `collective-category` and `product-category`. Add both fields as strings to new product documents; newly added garment categories appear on the homepage after the catalog is reloaded. The example garments have `demo: true`, an optional `description`, and illustrative prices and photos; they can be added to the bag for testing. Replace demo content with verified product details before selling. Running the seed script replaces documents with matching product IDs, so it can overwrite edits made in Firestore.

To use Firebase Storage later, upload image files you have permission to use, then replace each product's `images` array values with the corresponding Firebase Storage download URLs. The storefront already renders URL values from Firestore.

Run the app with `npm run dev`. Once the web config is set and the catalog is seeded, each app load fetches the catalog from Firestore. If the Firestore read fails, the site logs the error and shows the local preview catalog with an alert.
