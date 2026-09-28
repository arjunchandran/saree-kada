# Saree Kada

## Little Sree

Little Sree is a site-scoped AI guide for Saree Kada. It answers from the on-site catalog and published shopping details; it is not a general-purpose chatbot.

### Website

1. Copy `.env.example` to `.env` and set `GOOGLE_API_KEY` to a Gemini API key. The key is read by the server and is never sent to the browser.
2. Run `npm run dev` and open [http://localhost:3000](http://localhost:3000).

For production, run `npm run build` followed by `npm start`. The server serves the built site and the `/api/chat` endpoint from the same origin. Set `GOOGLE_API_KEY` in the hosting provider's server environment; do not put it in a `VITE_` variable.

### Notebook

Open `Little_Sree_Chat_Agent.ipynb` from the repository root, run its cells from top to bottom, and provide `GOOGLE_API_KEY` in the local `.env` file. The first code cell installs the notebook dependencies; the final cell launches the Gradio chat.
