#!/bin/bash

##############################################################################
# CREATE SITE - Create a new site from template
##############################################################################

set -e

echo ""
echo "🎨 CREATE NEW SITE"
echo "══════════════════════════════════════════════"
echo ""

# Get site name
SITE_NAME=$1

if [ -z "$SITE_NAME" ]; then
  echo "Usage: ./create-site.sh <site-name>"
  echo ""
  echo "Examples:"
  echo "  ./create-site.sh eko-vision"
  echo "  ./create-site.sh 0r8-ai"
  echo "  ./create-site.sh oracle-agency"
  echo ""
  exit 1
fi

SITE_PATH="./apps/${SITE_NAME}"

if [ -d "$SITE_PATH" ]; then
  echo "❌ Site '${SITE_NAME}' already exists at ${SITE_PATH}"
  exit 1
fi

# Copy from template
echo "📋 Copying template..."
cp -r ./apps/landing "$SITE_PATH"

# Update package.json
echo "⚙️  Updating configuration..."
sed -i "s/@mikedrop\/landing/@mikedrop\/${SITE_NAME}/g" "${SITE_PATH}/package.json"

# Clean up
rm -rf "${SITE_PATH}/.next" "${SITE_PATH}/node_modules" "${SITE_PATH}/.vercel" 2>/dev/null || true

echo ""
echo "✅ Site created at: ${SITE_PATH}"
echo ""
echo "Next steps:"
echo "  1. Edit your page:"
echo "     nano ${SITE_PATH}/app/page.tsx"
echo ""
echo "  2. Or paste code:"
echo "     node paste-deploy.js ${SITE_NAME}/app/page.tsx"
echo ""
echo "  3. Preview locally:"
echo "     cd ${SITE_PATH} && pnpm install && pnpm dev"
echo ""
echo "  4. Deploy:"
echo "     ./deploy-site.sh ${SITE_NAME}"
echo ""
