# ── Draken — Render.com Deployment Config ──────────────────────────────────
# This file tells Render how to build and run the backend.
# Upload backend/ folder contents to a GitHub repo and connect to Render.

# Build command: npm install
# Start command: node server.js
# Environment: Node 20

# ── Required Environment Variables on Render ────────────────────────────────
# Set these in the Render dashboard under "Environment" tab:
#
#   PORT=10000   (Render uses 10000 by default — server.js reads from process.env.PORT)
#
# Optional (only if you have Firebase Admin set up):
#   FIREBASE_SERVICE_ACCOUNT_PATH  — OR — paste the JSON content as FIREBASE_SERVICE_ACCOUNT_JSON
