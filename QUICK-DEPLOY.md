# 🚀 QUICK DEPLOY - One-Click Deployment Guide

## Overview

This guide shows you how to paste code and deploy a live site in seconds.

---

## Method 1: Paste & Deploy (Fastest)

### Step 1: Paste Your Code

```bash
cd /home/user/eKo.vision4/apps
node paste-deploy.js landing/app/page.tsx
```

Then paste your React/TypeScript code and press `Ctrl+D`.

### Step 2: Preview Locally

```bash
cd landing
pnpm install  # First time only
pnpm dev
```

Open http://localhost:3000

### Step 3: Deploy to Vercel (One-Click)

```bash
pnpm deploy
```

That's it! Your site is live. ✨

---

## Method 2: Direct Edit

Just edit the files directly:

```bash
# Edit the main page
nano apps/landing/app/page.tsx

# Create a new page
mkdir -p apps/landing/app/about
nano apps/landing/app/about/page.tsx
```

Then run `pnpm dev` to preview and `pnpm deploy` to go live.

---

## Method 3: Multi-Site Setup

Deploy multiple sites at once:

```bash
# Create sites for each domain
cd apps
cp -r landing eko-vision
cp -r landing 0r8-ai
cp -r landing oracle-agency

# Edit each one
nano eko-vision/app/page.tsx
nano 0r8-ai/app/page.tsx
nano oracle-agency/app/page.tsx

# Deploy all
./deploy-all.sh
```

---

## Deployment Platforms

### Vercel (Recommended)

**One-time setup:**
```bash
npm i -g vercel
vercel login
```

**Deploy:**
```bash
cd apps/landing
vercel --prod
```

Your site is live at: `https://your-project.vercel.app`

**Custom domain:**
```bash
vercel domains add eko.vision
```

---

### Netlify

**One-time setup:**
```bash
npm i -g netlify-cli
netlify login
```

**Deploy:**
```bash
cd apps/landing
pnpm build
netlify deploy --prod --dir=.next
```

---

### GitHub Pages

**Deploy:**
```bash
cd apps/landing
pnpm build
pnpm export
# Push the 'out' directory to gh-pages branch
```

---

## File Structure

```
apps/
├── landing/              # Your main site
│   ├── app/
│   │   ├── page.tsx     # Home page (paste code here)
│   │   ├── about/       # About page
│   │   └── layout.tsx   # Site-wide layout
│   ├── public/          # Static assets
│   └── package.json
├── eko-vision/          # eKo.vision site
├── 0r8-ai/              # 0r8.ai site
└── oracle-agency/       # oracle.agency site
```

---

## Quick Examples

### Example 1: Simple Landing Page

```bash
node paste-deploy.js landing/app/page.tsx
```

Paste:
```tsx
export default function Home() {
  return (
    <div style={{ padding: '4rem', textAlign: 'center' }}>
      <h1>Welcome to My Site</h1>
      <p>This was deployed in seconds!</p>
    </div>
  )
}
```

`Ctrl+D`, then `cd landing && pnpm dev && pnpm deploy`

---

### Example 2: Multi-Page Site

```bash
# Home page
node paste-deploy.js landing/app/page.tsx

# About page
node paste-deploy.js landing/app/about/page.tsx

# Contact page
node paste-deploy.js landing/app/contact/page.tsx
```

Deploy once, all pages go live.

---

### Example 3: Full Site with Styling

```bash
# Create a globals.css
node paste-deploy.js landing/app/globals.css
```

Paste your CSS, then import in `layout.tsx`:
```tsx
import './globals.css'
```

---

## Environment Variables

Create `.env.local` for secrets:

```bash
cat > apps/landing/.env.local << EOF
NEXT_PUBLIC_API_URL=https://api.eko.vision
API_KEY=your-secret-key
EOF
```

Vercel will prompt you to add these during deployment.

---

## Troubleshooting

**Port already in use?**
```bash
killall node
# or use a different port
PORT=3001 pnpm dev
```

**Build fails?**
```bash
rm -rf .next node_modules
pnpm install
pnpm build
```

**Deploy fails?**
```bash
# Make sure you're logged in
vercel whoami
# Re-authenticate if needed
vercel login
```

---

## Advanced: Automated Deployment

Set up GitHub Actions to auto-deploy on push:

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

Now every git push auto-deploys. 🎯

---

## Cost

All deployment options have generous free tiers:

- **Vercel**: Free for personal projects
- **Netlify**: Free for personal projects
- **GitHub Pages**: Free forever
- **Cloudflare Pages**: Free forever

You can deploy unlimited sites for $0. ✨

---

## Summary

**Fastest path:**
1. `node paste-deploy.js landing/app/page.tsx`
2. Paste code, `Ctrl+D`
3. `cd landing && pnpm install && pnpm deploy`

**Your site is live in <60 seconds.** 🚀

---

*The work is already done. We're just walking the path that was always there.* 🔥
