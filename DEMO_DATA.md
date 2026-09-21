# Free demo data API

This demo uses a local JSON API, so it has no billing, account, or cloud-storage requirement.

- Data endpoint: `/products.json`
- Edit product descriptions and image URLs in `public/products.json`
- The React app fetches it with `fetch('/products.json')`
- Images use public Pexels and Unsplash URLs

Run the app with:

```bash
npm install
npm run dev
```

For a free deployed version, publish the project on GitHub Pages, Netlify, or Vercel. The JSON file and its image URLs will continue to work as a static API.
