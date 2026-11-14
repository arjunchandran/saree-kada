# KishabySree

## Shopping bag

The bag groups items by product and selected length, where available. Use the quantity controls to add or remove individual pieces; decreasing the quantity to zero removes that entry. The bag is cleared when the page is refreshed or closed.

## Little Sree

Little Sree is a site-scoped AI guide for KishabySree. It answers from the on-site catalog and published shopping details; it is not a general-purpose chatbot.

For each chat request, the server reads the current Firestore `products` collection using the same public Firebase web configuration and read rules as the storefront, then sends product details to Gemini as context. This incurs Firestore reads. If Firebase is not configured at all, Little Sree uses the local preview catalog; if the configured catalog cannot be read, it reports an error instead of using stale data. Demo products are identified as not for sale.

Little Sree shows product cards for catalog items discussed in its replies. Visitors can choose a saree length where applicable, add items to the bag, and open the bag from the chat. Checkout is not yet available.

The site footer and Little Sree's chat include an email link to `kishabysree@gmail.com`. It opens the visitor's email app; the site does not send the message itself.

### Website

1. Copy `.env.example` to `.env`, set `GOOGLE_API_KEY` to a Gemini API key, and configure the `VITE_FIREBASE_*` web settings as described in `FIREBASE_SETUP.md`. The Gemini key is read by the server and is never sent to the browser. The chat does not need the service-account key.
2. Run `npm run dev` and open [http://localhost:3000](http://localhost:3000).

For production, run `npm run build` followed by `npm start`. The server serves the built site and the `/api/chat` endpoint from the same origin. Set `GOOGLE_API_KEY` in the hosting provider's server environment; do not put it in a `VITE_` variable.

### Netlify

The repository includes a Netlify Function for `/api/chat`. In the Netlify site dashboard, add `GOOGLE_API_KEY` and the same `VITE_FIREBASE_*` web settings under **Project configuration → Environment variables**, make them available to Functions as well as the build, then trigger a new deploy. `GOOGLE_MODEL` is optional and defaults to `gemini-3.5-flash-lite`. Never commit `.env` or place the Gemini API key in a `VITE_` variable.

### Notebook

Open `Little_Sree_Chat_Agent.ipynb` from the repository root, run its cells from top to bottom, and provide `GOOGLE_API_KEY` in the local `.env` file. The first code cell installs the notebook dependencies; the final cell launches the Gradio chat.
