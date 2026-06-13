#!/usr/bin/env bash
# AmaarBazar — one-command new-repo setup
# Usage: bash setup-amaarbazar.sh https://github.com/Nozmun/amaarbazar.git
set -e

REMOTE="$1"
if [ -z "$REMOTE" ]; then
  echo "Usage: bash setup-amaarbazar.sh <github-repo-url>"
  echo "Example: bash setup-amaarbazar.sh https://github.com/Nozmun/amaarbazar.git"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$SCRIPT_DIR/amaarbazar"
WORK="$(mktemp -d)"

echo "📦  Copying AmaarBazar files..."
cp -r "$SRC/." "$WORK/"

echo "🔧  Initialising git..."
cd "$WORK"
git init
git checkout -b main

mkdir -p .github/workflows
cat > .github/workflows/deploy.yml << 'WORKFLOW'
name: Deploy to GitHub Pages
on:
  push:
    branches: [main, master]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
      - id: deployment
        uses: actions/deploy-pages@v4
WORKFLOW

cat > README.md << 'README'
# AmaarBazar — আমারবাজার

Bangladesh's free classifieds marketplace.

- English ⇄ Bengali language toggle
- bKash, Nagad, Rocket & card payment flow
- BDT (৳) currency with Bengali numerals
- Fully responsive, high-end animations
README

git config user.email "nozmun@gmail.com"
git config user.name "Nozmun"
git add .
git commit -m "Initial commit: AmaarBazar marketplace"

echo "🚀  Pushing to GitHub..."
git remote add origin "$REMOTE"
git push -u origin main

REPO_URL="${REMOTE%.git}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅  Done! All files pushed to GitHub."
echo ""
echo "LAST STEP — Enable GitHub Pages (same as ZatzPartners):"
echo "1. Go to: $REPO_URL/settings/pages"
echo "2. Under 'Source' → select GitHub Actions"
echo "3. Click Save"
echo ""
echo "Your site will be live in ~2 minutes at:"
echo "  https://nozmun.github.io/amaarbazar"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
