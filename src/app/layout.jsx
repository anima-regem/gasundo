import './globals.css'

import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'

export const metadata = {
  title: 'GasUndo Kochi - Live Restaurant Status Map',
  description:
    'GasUndo Kochi is a crowdsourced live map showing which restaurants are open or closed during the LPG shortage in Kochi, India.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GasUndo Kochi',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/icon-192.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1a1a2e',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#1a1a2e] text-white antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
