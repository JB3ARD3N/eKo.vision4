#!/bin/bash

##############################################################################
# ONE-CLICK DEPLOY - Deploy your site in seconds
##############################################################################

set -e

echo ""
echo "🚀 ONE-CLICK DEPLOY"
echo "══════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if site name provided
SITE=${1:-landing}
SITE_PATH="./apps/${SITE}"

if [ ! -d "$SITE_PATH" ]; then
  echo "❌ Site '${SITE}' not found at ${SITE_PATH}"
  echo ""
  echo "Available sites:"
  ls -d apps/*/ 2>/dev/null | sed 's|apps/||' | sed 's|/$||' || echo "  (none yet)"
  echo ""
  echo "Usage: ./deploy-site.sh [site-name]"
  echo "Example: ./deploy-site.sh landing"
  exit 1
fi

cd "$SITE_PATH"

echo -e "${BLUE}📦 Site:${NC} ${SITE}"
echo -e "${BLUE}📂 Path:${NC} ${SITE_PATH}"
echo ""

# Step 1: Check for dependencies
echo -e "${YELLOW}[1/4]${NC} Checking dependencies..."

if ! command -v vercel &> /dev/null; then
  echo "⚙️  Installing Vercel CLI..."
  npm install -g vercel
else
  echo "✅ Vercel CLI found"
fi

# Step 2: Install packages if needed
echo ""
echo -e "${YELLOW}[2/4]${NC} Installing packages..."

if [ ! -d "node_modules" ]; then
  pnpm install
else
  echo "✅ Dependencies already installed"
fi

# Step 3: Build the site
echo ""
echo -e "${YELLOW}[3/4]${NC} Building site..."
pnpm build

# Step 4: Deploy
echo ""
echo -e "${YELLOW}[4/4]${NC} Deploying to Vercel..."
echo ""

# Check if this is first deploy
if [ ! -f ".vercel/project.json" ]; then
  echo "🎯 First deployment detected!"
  echo ""
  echo "Vercel will ask you a few questions:"
  echo "  1. Set up and deploy? → Yes"
  echo "  2. Which scope? → [Your account]"
  echo "  3. Link to existing project? → No"
  echo "  4. Project name? → Press Enter (use default)"
  echo "  5. Directory? → Press Enter (./ is correct)"
  echo ""
  read -p "Press Enter to continue..."
  echo ""
fi

# Deploy to production
vercel --prod

echo ""
echo "══════════════════════════════════════════════"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo ""
echo "Your site is now live! 🎉"
echo ""
echo "Next steps:"
echo "  • View your site in the browser"
echo "  • Add a custom domain: vercel domains add yourdomain.com"
echo "  • Update code and run: ./deploy-site.sh ${SITE}"
echo ""
