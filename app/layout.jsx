import './globals.css'

export const metadata = {
  title: 'GapCheck — JD vs Resume Gap Analyzer',
  description:
    'Paste a Job Description and your Resume to instantly see your match score, missing skills ranked by importance, and AI-rewritten resume bullets tailored to the role.',
  keywords: ['resume analyzer', 'job description', 'skill gap', 'career', 'AI resume', 'ATS'],
  authors: [{ name: 'GapCheck' }],
  openGraph: {
    title: 'GapCheck — JD vs Resume Gap Analyzer',
    description: 'Find out exactly where your resume falls short — and how to fix it.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
