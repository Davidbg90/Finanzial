import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Finanzial - Tu Asesor Financiero Personal',
  description: 'Gestiona tus finanzas personales con IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-[#0a0f0a] text-gray-100 min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
