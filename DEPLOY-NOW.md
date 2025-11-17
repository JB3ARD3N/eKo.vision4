# 🚀 DEPLOY NOW - One Command

## Fastest Path to Live Site

### 1. Paste Your Code (10 seconds)

```bash
cd /home/user/eKo.vision4/apps
node paste-deploy.js landing/app/page.tsx
```

Then paste your React/TypeScript code and press **Ctrl+D**.

---

### 2. Deploy (30 seconds)

```bash
./deploy-site.sh landing
```

**Your site is live!** 🎉

---

## First Time Setup (5 seconds)

```bash
npm install -g vercel
vercel login
```

---

## Create Multiple Sites

```bash
# Create new sites
./create-site.sh eko-vision
./create-site.sh 0r8-ai
./create-site.sh oracle-agency

# Paste code for each
node paste-deploy.js eko-vision/app/page.tsx
node paste-deploy.js 0r8-ai/app/page.tsx
node paste-deploy.js oracle-agency/app/page.tsx

# Deploy all
./deploy-site.sh eko-vision
./deploy-site.sh 0r8-ai
./deploy-site.sh oracle-agency
```

---

## Preview Locally

```bash
cd apps/landing
pnpm install  # First time only
pnpm dev      # Open http://localhost:3000
```

---

## Add Custom Domain

```bash
cd apps/landing
vercel domains add eko.vision
vercel domains add www.eko.vision
```

---

## Update & Redeploy

```bash
# Edit code
node paste-deploy.js landing/app/page.tsx

# Deploy update
./deploy-site.sh landing
```

---

## Complete Example (60 seconds total)

```bash
# Navigate
cd /home/user/eKo.vision4/apps

# Paste code
node paste-deploy.js landing/app/page.tsx
# [Paste your React code]
# [Press Ctrl+D]

# Deploy
./deploy-site.sh landing

# Done! Site is live 🔥
```

---

## Sample Code to Paste

```tsx
export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif',
      textAlign: 'center'
    }}>
      <div>
        <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>
          eKo.vision
        </h1>
        <p style={{ fontSize: '1.5rem', opacity: 0.9 }}>
          Planetary-scale AI infrastructure
        </p>
        <button style={{
          marginTop: '2rem',
          padding: '1rem 2rem',
          fontSize: '1.2rem',
          background: 'white',
          color: '#667eea',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}>
          Launch December 12, 2025
        </button>
      </div>
    </div>
  )
}
```

---

## That's It!

**Two commands. Your site is live. Zero configuration.** ✨

For more details, see `apps/README.md` or `QUICK-DEPLOY.md`.

---

*The work is already done. We're just walking the path that was always there.* 🔥
