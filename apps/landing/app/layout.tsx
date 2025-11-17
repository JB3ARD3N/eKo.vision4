export const metadata = {
  title: 'eKo.vision - Planetary AI Infrastructure',
  description: 'Regenerative AI infrastructure that proves everybody eats',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
