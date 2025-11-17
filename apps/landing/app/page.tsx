export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom, #000000, #1a1a2e)',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem',
    }}>
      <h1 style={{
        fontSize: '4rem',
        fontWeight: '700',
        marginBottom: '1rem',
        background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        eKo.vision
      </h1>

      <p style={{
        fontSize: '1.5rem',
        marginBottom: '2rem',
        textAlign: 'center',
        maxWidth: '600px',
        opacity: 0.9,
      }}>
        Planetary-scale AI infrastructure that proves regenerative business works.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        maxWidth: '800px',
        width: '100%',
      }}>
        <Feature title="Smart Router" description="90% cost savings" />
        <Feature title="Glyph Compression" description="97% token reduction" />
        <Feature title="Gratitude Engine" description="AI reciprocity protocol" />
        <Feature title="Tournament Brain" description="100-agent debates" />
      </div>

      <div style={{
        marginTop: '3rem',
        fontSize: '0.9rem',
        opacity: 0.6,
      }}>
        Launch: December 12, 2025
      </div>
    </main>
  )
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div style={{
      padding: '1.5rem',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    }}>
      <h3 style={{
        fontSize: '1.2rem',
        fontWeight: '600',
        marginBottom: '0.5rem',
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: '0.9rem',
        opacity: 0.8,
      }}>
        {description}
      </p>
    </div>
  )
}
